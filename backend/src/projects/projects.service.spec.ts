// Developed by Hever-Alfonso

// External imports
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// Internal imports
import { Project } from './entities/project.entity.js';
import { ProjectsService } from './projects.service.js';
import { ProjectUserRemovedEvent } from './events/project-user-removed.event.js';
import { UsersService } from '../users/users.service.js';

describe('ProjectsService', () => {
  const relationBuilder = { of: vi.fn(), add: vi.fn(), remove: vi.fn() };
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    merge: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const usersService = {
    findOne: vi.fn(),
    findByIds: vi.fn(),
    findAllExcept: vi.fn(),
  };
  const eventEmitter = { emitAsync: vi.fn() };
  let service: ProjectsService;

  const project = { id: 10, name: 'Mobile App', userIds: [1, 2] } as Project;

  beforeEach(async () => {
    vi.clearAllMocks();
    relationBuilder.of.mockReturnValue(relationBuilder);
    repository.createQueryBuilder.mockReturnValue({
      relation: vi.fn().mockReturnValue(relationBuilder),
    });
    usersService.findByIds.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: repository },
        { provide: UsersService, useValue: usersService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  describe('findOneForUser', () => {
    it('returns the project to a member', async () => {
      repository.findOneBy.mockResolvedValue(project);

      await expect(service.findOneForUser(10, 1)).resolves.toBe(project);
    });

    it('hides a project the user does not belong to', async () => {
      repository.findOneBy.mockResolvedValue(project);

      await expect(service.findOneForUser(10, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('reports a missing project as not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOneForUser(404, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addUser', () => {
    it('rejects a user already on the project', async () => {
      repository.findOneBy.mockResolvedValue(project);
      usersService.findOne.mockResolvedValue({ id: 2 });

      await expect(service.addUser(10, 2, 1)).rejects.toThrow(
        ConflictException,
      );
      expect(relationBuilder.add).not.toHaveBeenCalled();
    });

    it('adds a user who is not a member yet', async () => {
      repository.findOneBy.mockResolvedValue(project);
      usersService.findOne.mockResolvedValue({ id: 3 });

      await service.addUser(10, 3, 1);

      expect(relationBuilder.add).toHaveBeenCalledWith(3);
    });
  });

  describe('removeUser', () => {
    it('refuses to remove the caller from their own project', async () => {
      await expect(service.removeUser(10, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(relationBuilder.remove).not.toHaveBeenCalled();
    });

    it('rejects a user who is not on the project', async () => {
      repository.findOneBy.mockResolvedValue(project);

      await expect(service.removeUser(10, 99, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(relationBuilder.remove).not.toHaveBeenCalled();
    });

    it('removes the member and announces it so their tasks are unassigned', async () => {
      repository.findOneBy.mockResolvedValue(project);

      await service.removeUser(10, 2, 1);

      expect(relationBuilder.remove).toHaveBeenCalledWith(2);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        ProjectUserRemovedEvent.NAME,
        new ProjectUserRemovedEvent(10, 2),
      );
    });
  });

  describe('create', () => {
    it('adds the creator as the first member', async () => {
      usersService.findOne.mockResolvedValue({ id: 5 });
      repository.create.mockImplementation((dto: Partial<Project>) => ({
        ...dto,
      }));
      repository.merge.mockImplementation(
        (target: Project, changes: Partial<Project>) =>
          Object.assign(target, changes),
      );
      repository.save.mockImplementation((entity: Project) =>
        Object.assign(entity, { id: 11 }),
      );
      repository.findOneBy.mockResolvedValue(
        Object.assign({}, project, { id: 11 }),
      );

      await service.create(
        { name: 'New', description: '', status: 'active' },
        5,
      );

      const saved = repository.save.mock.calls[0][0] as Project;
      expect(saved.users).toEqual([{ id: 5 }]);
    });
  });
});
