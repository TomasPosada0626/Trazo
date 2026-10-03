// Author: Mateo Garcia Carreno

// external imports
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

// internal imports
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserRowDto } from './dto/user-row.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { id: 'ASC' } });
  }

  async findRows(): Promise<UserRowDto[]> {
    const users = await this.findAll();

    // Counted through the inverse relation rather than by asking
    // ProjectsService, which already depends on this service.
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

    return users.map((user) =>
      Object.assign(user, { activeProjects: activeProjects.get(user.id) ?? 0 }),
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('The user does not exist.');
    }

    return user;
  }

  findByIds(ids: number[]): Promise<User[]> {
    return this.usersRepository.find({
      where: { id: In(ids) },
      order: { id: 'ASC' },
    });
  }

  findAllExcept(ids: number[]): Promise<User[]> {
    return this.usersRepository.find({
      where: { id: Not(In(ids)) },
      order: { id: 'ASC' },
    });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.assertEmailAvailable(createUserDto.email);

    const user = this.usersRepository.create(createUserDto);
    const saved = await this.usersRepository.save(user);

    // Re-read so the response goes through `select: false` and never echoes
    // the password back.
    return this.findOne(saved.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.email !== undefined) {
      await this.assertEmailAvailable(updateUserDto.email, id);
    }

    await this.usersRepository.save(
      this.usersRepository.merge(user, updateUserDto),
    );

    return this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    await this.findOne(id);

    // The foreign keys unassign the user's tasks and drop them from every
    // project roster, so nothing else has to be cleaned up here.
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
