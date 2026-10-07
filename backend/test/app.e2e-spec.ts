// Developed by Hever-Alfonso

// External imports
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

// Internal imports
import type { UsersService } from '../src/users/users.service.js';

process.env.SQLITE_PATH = ':memory:';

describe('API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let memberToken: string;

  const login = async (email: string, password: string) =>
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module.js');
    const { UsersService: UsersServiceClass } =
      await import('../src/users/users.service.js');

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const usersService: UsersService = app.get(UsersServiceClass);
    await usersService.create({
      name: 'Ana Duarte',
      email: 'admin@trazo.com',
      password: 'admin123',
      role: 'admin',
    });
    await usersService.create({
      name: 'Maria Lopez',
      email: 'maria@trazo.com',
      password: 'member123',
      role: 'member',
    });

    adminToken = (await login('admin@trazo.com', 'admin123')).body
      .access_token as string;
    memberToken = (await login('maria@trazo.com', 'member123')).body
      .access_token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('returns a token for valid credentials', async () => {
      const response = await login('admin@trazo.com', 'admin123');

      expect(response.status).toBe(200);
      expect(typeof response.body.access_token).toBe('string');
    });

    it('rejects a wrong password', async () => {
      const response = await login('admin@trazo.com', 'wrong-password');

      expect(response.status).toBe(401);
      expect(response.body.access_token).toBeUndefined();
    });

    it('rejects an unknown email', async () => {
      const response = await login('nobody@trazo.com', 'admin123');

      expect(response.status).toBe(401);
    });
  });

  describe('AuthGuard', () => {
    it('rejects a protected route without a token', async () => {
      await request(app.getHttpServer()).get('/api/projects').expect(401);
    });

    it('rejects a malformed token', async () => {
      await request(app.getHttpServer())
        .get('/api/projects')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('accepts a valid token', async () => {
      await request(app.getHttpServer())
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('returns the caller profile without the password', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe('admin@trazo.com');
      expect(response.body.password).toBeUndefined();
    });
  });

  describe('AdminGuard', () => {
    it('rejects a non-admin on an admin-only route', async () => {
      await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Nope', description: '', status: 'active' })
        .expect(403);
    });

    it('rejects a non-admin on the users listing', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    it('lets an admin through', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('projects CRUD round-trip', () => {
    let projectId: number;

    it('creates a project', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Mobile App Redesign',
          description: 'Overhaul of the mobile experience.',
          status: 'active',
        })
        .expect(201);

      projectId = response.body.id as number;
      expect(response.body.name).toBe('Mobile App Redesign');
    });

    it('reads it back', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
    });

    it('hides it from a user who is not a member', async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(404);
    });

    it('updates it', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'paused' })
        .expect(200);

      expect(response.body.status).toBe('paused');
    });

    it('rejects a payload with unknown fields', async () => {
      await request(app.getHttpServer())
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nonsense: true })
        .expect(400);
    });

    it('deletes it', async () => {
      await request(app.getHttpServer())
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
