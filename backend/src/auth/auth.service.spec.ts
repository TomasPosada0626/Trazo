// Developed by Hever-Alfonso

// External imports
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

// Internal imports
import { AuthService } from './auth.service.js';
import { PasswordUtils } from '../common/password.utils.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  const usersService = { findByEmailWithPassword: vi.fn() };
  const jwtService = { signAsync: vi.fn() };
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('issues a token when the password matches the stored hash', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      email: 'admin@trazo.com',
      password: await PasswordUtils.hash('admin123'),
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.signIn('admin@trazo.com', 'admin123'),
    ).resolves.toEqual({ access_token: 'signed-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'admin@trazo.com',
    });
  });

  it('rejects a wrong password', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      email: 'admin@trazo.com',
      password: await PasswordUtils.hash('admin123'),
    });

    await expect(service.signIn('admin@trazo.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects the stored hash submitted as the password', async () => {
    const hash = await PasswordUtils.hash('admin123');
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      email: 'admin@trazo.com',
      password: hash,
    });

    await expect(service.signIn('admin@trazo.com', hash)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an unknown email', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.signIn('nobody@trazo.com', 'admin123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a missing email or password without hitting the database', async () => {
    await expect(service.signIn('', 'admin123')).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(service.signIn('admin@trazo.com', '')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(usersService.findByEmailWithPassword).not.toHaveBeenCalled();
  });

  it('trims the email before looking the user up', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.signIn('  admin@trazo.com  ', 'admin123'),
    ).rejects.toThrow(UnauthorizedException);
    expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(
      'admin@trazo.com',
    );
  });
});
