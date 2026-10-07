// Developed by Hever-Alfonso

// External imports
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// Internal imports
import { ProjectsService } from '../projects/projects.service.js';
import { ProjectUserRemovedEvent } from '../projects/events/project-user-removed.event.js';
import { Task } from './entities/task.entity.js';
import { TasksService } from './tasks.service.js';
import { UsersService } from '../users/users.service.js';

describe('TasksService', () => {
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    merge: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  };
  const projectsService = {
    findOne: vi.fn(),
    findOneForUser: vi.fn(),
    findAllForUser: vi.fn(),
    hasUser: vi.fn(),
  };
  const usersService = { findOne: vi.fn(), findByIds: vi.fn() };
  let service: TasksService;

  const project = { id: 10, name: 'Mobile App', userIds: [1, 2] };
  const payload = {
    title: 'Design the onboarding flow',
    description: '',
    type: 'feature' as const,
    storyPoints: 5,
    priority: 'high' as const,
    status: 'todo' as const,
    projectId: 10,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    projectsService.findOne.mockResolvedValue(project);
    projectsService.findOneForUser.mockResolvedValue(project);
    projectsService.hasUser.mockImplementation(
      (target: { userIds: number[] }, userId: number) =>
        target.userIds.includes(userId),
    );
    repository.create.mockImplementation((dto: Partial<Task>) => ({ ...dto }));
    repository.merge.mockImplementation(
      (target: Task, ...changes: Partial<Task>[]) =>
        Object.assign(target, ...changes),
    );
    repository.save.mockImplementation((entity: Task) =>
      Object.assign(entity, { id: 30 }),
    );
    repository.findOneBy.mockResolvedValue({
      id: 30,
      projectId: 10,
      assigneeId: null,
    } as Task);

    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repository },
        { provide: ProjectsService, useValue: projectsService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  describe('create', () => {
    it('accepts an assignee who belongs to the project', async () => {
      await service.create({ ...payload, assigneeId: 2 }, 1);

      const saved = repository.save.mock.calls[0][0] as Task;
      expect(saved.assignee).toEqual({ id: 2 });
    });

    it('rejects an assignee who is not on the project', async () => {
      await expect(
        service.create({ ...payload, assigneeId: 99 }, 1),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('accepts an unassigned task', async () => {
      await service.create(payload, 1);

      const saved = repository.save.mock.calls[0][0] as Task;
      expect(saved.assignee).toBeNull();
      expect(saved.sprint).toBeNull();
    });

    it('refuses to file a task under a project the user does not belong to', async () => {
      projectsService.findOneForUser.mockRejectedValue(
        new NotFoundException('The project does not exist.'),
      );

      await expect(service.create(payload, 99)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('rejects moving a task to an assignee outside its project', async () => {
      await expect(service.update(30, { assigneeId: 99 }, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('unschedules a task that moves to another project', async () => {
      projectsService.findOneForUser.mockResolvedValue({
        id: 11,
        userIds: [1],
      });

      await service.update(30, { projectId: 11 }, 1);

      const saved = repository.save.mock.calls[0][0] as Task;
      expect(saved.sprint).toBeNull();
    });
  });

  describe('assertInProject', () => {
    it('accepts tasks that belong to the project', async () => {
      repository.find.mockResolvedValue([{ id: 30 }, { id: 31 }] as Task[]);

      await expect(
        service.assertInProject(10, [30, 31]),
      ).resolves.toBeUndefined();
    });

    it('rejects a task from another project', async () => {
      repository.find.mockResolvedValue([{ id: 30 }] as Task[]);

      await expect(service.assertInProject(10, [30, 999])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOneForUser', () => {
    it('hides a task whose project the user is not on', async () => {
      await expect(service.findOneForUser(30, 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unassignFromProject', () => {
    it('clears the assignee on that user tasks when they leave the project', async () => {
      repository.find.mockResolvedValue([
        { id: 30, assigneeId: 2 },
        { id: 31, assigneeId: 1 },
        { id: 32, assigneeId: 2 },
      ] as Task[]);

      await service.unassignFromProject(new ProjectUserRemovedEvent(10, 2));

      expect(repository.update).toHaveBeenCalledWith(
        { id: In([30, 32]) },
        { assignee: null },
      );
    });

    it('does nothing when the user had no tasks', async () => {
      repository.find.mockResolvedValue([{ id: 31, assigneeId: 1 }] as Task[]);

      await service.unassignFromProject(new ProjectUserRemovedEvent(10, 2));

      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
