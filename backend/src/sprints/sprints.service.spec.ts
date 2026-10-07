// Developed by Hever-Alfonso

// External imports
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// Internal imports
import { ProjectsService } from '../projects/projects.service.js';
import { Sprint } from './entities/sprint.entity.js';
import { SprintsService } from './sprints.service.js';
import { TasksService } from '../tasks/tasks.service.js';

describe('SprintsService', () => {
  const repository = {
    find: vi.fn(),
    findBy: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    merge: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
  const projectsService = {
    findOne: vi.fn(),
    findOneForUser: vi.fn(),
    findAllForUser: vi.fn(),
    hasUser: vi.fn(),
  };
  const tasksService = {
    assertInProject: vi.fn(),
    scheduleInSprint: vi.fn(),
    findByProjects: vi.fn(),
  };
  let service: SprintsService;

  const payload = {
    name: 'Onboarding v2',
    goal: 'Email verification',
    startDate: '2026-02-04',
    endDate: '2026-02-18',
    status: 'planned' as const,
    projectId: 10,
    taskIds: [],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    repository.findBy.mockResolvedValue([]);
    repository.create.mockImplementation((dto: Partial<Sprint>) => ({
      ...dto,
    }));
    repository.merge.mockImplementation(
      (target: Sprint, changes: Partial<Sprint>) =>
        Object.assign(target, changes),
    );
    repository.save.mockImplementation((entity: Sprint) =>
      Object.assign(entity, { id: 20 }),
    );
    repository.findOneBy.mockResolvedValue({ id: 20, projectId: 10 } as Sprint);
    projectsService.findOneForUser.mockResolvedValue({ id: 10, userIds: [1] });

    const module = await Test.createTestingModule({
      providers: [
        SprintsService,
        { provide: getRepositoryToken(Sprint), useValue: repository },
        { provide: ProjectsService, useValue: projectsService },
        { provide: TasksService, useValue: tasksService },
      ],
    }).compile();

    service = module.get(SprintsService);
  });

  describe('create', () => {
    it('stores a sprint whose name is free within the project', async () => {
      await service.create(payload, 1);

      expect(repository.save).toHaveBeenCalled();
      expect(tasksService.scheduleInSprint).toHaveBeenCalledWith(20, 10, []);
    });

    it('rejects a name already used in the same project, ignoring case and spaces', async () => {
      repository.findBy.mockResolvedValue([
        { id: 19, name: '  onboarding V2 ' } as Sprint,
      ]);

      await expect(service.create(payload, 1)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects an end date that falls before the start date', async () => {
      await expect(
        service.create({ ...payload, endDate: '2026-02-01' }, 1),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('refuses to plan a sprint on a project the user does not belong to', async () => {
      projectsService.findOneForUser.mockRejectedValue(
        new NotFoundException('The project does not exist.'),
      );

      await expect(service.create(payload, 99)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('refuses to schedule tasks that belong to another project', async () => {
      tasksService.assertInProject.mockRejectedValue(
        new BadRequestException(
          "Every scheduled task must belong to the sprint's project.",
        ),
      );

      await expect(
        service.create({ ...payload, taskIds: [500] }, 1),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('lets a sprint keep its own name', async () => {
      projectsService.findOne.mockResolvedValue({ id: 10, userIds: [1] });
      projectsService.hasUser.mockReturnValue(true);
      repository.findOneBy.mockResolvedValue({
        id: 20,
        projectId: 10,
        name: 'Onboarding v2',
        startDate: '2026-02-04',
        endDate: '2026-02-18',
      } as Sprint);
      repository.findBy.mockResolvedValue([
        { id: 20, name: 'Onboarding v2' } as Sprint,
      ]);

      await expect(
        service.update(20, { name: 'Onboarding v2' }, 1),
      ).resolves.toBeDefined();
    });

    it('rejects a name already held by a different sprint', async () => {
      projectsService.findOne.mockResolvedValue({ id: 10, userIds: [1] });
      projectsService.hasUser.mockReturnValue(true);
      repository.findOneBy.mockResolvedValue({
        id: 20,
        projectId: 10,
        name: 'Onboarding v2',
        startDate: '2026-02-04',
        endDate: '2026-02-18',
      } as Sprint);
      repository.findBy.mockResolvedValue([
        { id: 21, name: 'Flow design' } as Sprint,
      ]);

      await expect(
        service.update(20, { name: 'Flow design' }, 1),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOneForUser', () => {
    it('hides a sprint belonging to a project the user is not on', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 20,
        projectId: 10,
      } as Sprint);
      projectsService.findOne.mockResolvedValue({ id: 10, userIds: [1] });
      projectsService.hasUser.mockReturnValue(false);

      await expect(service.findOneForUser(20, 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
