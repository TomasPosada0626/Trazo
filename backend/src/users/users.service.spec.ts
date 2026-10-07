// Developed by Hever-Alfonso

// External imports
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// Internal imports
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const repository = {
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    delete: vi.fn(),
  };
  let service: UsersService;

  const makeUser = (overrides: Partial<User> = {}): User =>
    Object.assign(
      {
        id: 1,
        name: 'Ana Duarte',
        email: 'admin@trazo.com',
        password: 'stored-hash',
        role: 'admin',
      },
      overrides,
    ) as User;

  beforeEach(async () => {
    vi.clearAllMocks();
    repository.create.mockImplementation((dto: Partial<User>) => ({ ...dto }));
    repository.merge.mockImplementation(
      (target: User, changes: Partial<User>) => Object.assign(target, changes),
    );

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('rejects an email that already belongs to another user', async () => {
      repository.findOneBy.mockResolvedValue(makeUser());

      await expect(
        service.create({
          name: 'Clone',
          email: 'admin@trazo.com',
          password: 'secret123',
          role: 'member',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('stores a bcrypt hash instead of the submitted password', async () => {
      repository.findOneBy.mockImplementation(
        (where: { email?: string; id?: number }) =>
          where.email ? null : makeUser({ id: 7 }),
      );
      repository.save.mockImplementation((user: User) =>
        Object.assign(user, { id: 7 }),
      );

      await service.create({
        name: 'Nuevo',
        email: 'nuevo@trazo.com',
        password: 'secret123',
        role: 'member',
      });

      const saved = repository.save.mock.calls[0][0] as User;
      expect(saved.password).not.toBe('secret123');
      expect(saved.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('update', () => {
    it('hashes a new password before saving it', async () => {
      repository.findOneBy.mockResolvedValue(makeUser());

      await service.update(1, { password: 'brandnew123' });

      const saved = repository.save.mock.calls[0][0] as User;
      expect(saved.password).not.toBe('brandnew123');
      expect(saved.password).toMatch(/^\$2[aby]\$/);
    });

    it('leaves the stored hash alone when no password is sent', async () => {
      repository.findOneBy.mockResolvedValue(makeUser());

      await service.update(1, { name: 'Renamed' });

      const saved = repository.save.mock.calls[0][0] as User;
      expect(saved.password).toBe('stored-hash');
      expect(saved.name).toBe('Renamed');
    });

    it('rejects an email already taken by a different user', async () => {
      repository.findOneBy.mockImplementation(
        (where: { email?: string; id?: number }) =>
          where.email ? makeUser({ id: 2 }) : makeUser(),
      );

      await expect(
        service.update(1, { email: 'taken@trazo.com' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('refuses to delete the account in session', async () => {
      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('deletes any other account', async () => {
      repository.findOneBy.mockResolvedValue(makeUser({ id: 2 }));

      await service.remove(2, 1);

      expect(repository.delete).toHaveBeenCalledWith(2);
    });
  });
});
