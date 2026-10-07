// Developed by Mateo Garcia Carreno

// External imports
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Internal imports
import { CreateUserDto } from './dto/create-user.dto.js';
import { PasswordUtils } from '../common/password.utils.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({ order: { id: 'ASC' } });

    const counts = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.projects', 'project', 'project.status = :status', {
        status: 'active',
      })
      .select('user.id', 'id')
      .addSelect('COUNT(project.id)', 'activeProjects')
      .groupBy('user.id')
      .getRawMany<{ id: number; activeProjects: number }>();
    const activeProjects = new Map(
      counts.map((row) => [row.id, row.activeProjects]),
    );

    for (const user of users) {
      user.activeProjects = activeProjects.get(user.id) ?? 0;
    }

    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('The user does not exist.');
    }

    return user;
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return await this.usersRepository.find({
      where: { id: In(ids) },
      order: { id: 'ASC' },
    });
  }

  async findAllExcept(ids: number[]): Promise<User[]> {
    return await this.usersRepository.find({
      where: { id: Not(In(ids)) },
      order: { id: 'ASC' },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.assertEmailAvailable(createUserDto.email);

    const user = this.usersRepository.create(createUserDto);
    user.password = await PasswordUtils.hash(createUserDto.password);
    const saved = await this.usersRepository.save(user);

    return await this.findOne(saved.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.email !== undefined) {
      await this.assertEmailAvailable(updateUserDto.email, id);
    }

    const merged = this.usersRepository.merge(user, updateUserDto);
    if (updateUserDto.password !== undefined) {
      merged.password = await PasswordUtils.hash(updateUserDto.password);
    }

    await this.usersRepository.save(merged);

    return await this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    await this.findOne(id);

    await this.usersRepository.delete(id);
  }

  private async assertEmailAvailable(
    email: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.usersRepository.findOneBy({ email });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('A user with this email already exists.');
    }
  }
}
