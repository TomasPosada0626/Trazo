// Author: Mateo Garcia Carreno

// external imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import type { Relation } from 'typeorm';

// internal imports
import { Project } from '../../projects/entities/project.entity.js';
import { Sprint } from '../../sprints/entities/sprint.entity.js';
import { User } from '../../users/entities/user.entity.js';

export const TASK_TYPES = ['feature', 'bug', 'chore', 'research'] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-enum', enum: TASK_TYPES })
  type: TaskType;

  @Column({ type: 'int' })
  storyPoints: number;

  @Column({ type: 'simple-enum', enum: TASK_PRIORITIES })
  priority: TaskPriority;

  @Column({ type: 'simple-enum', enum: TASK_STATUSES })
  status: TaskStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Relation<Project>;

  @RelationId((task: Task) => task.project)
  projectId: number;

  @ManyToOne(() => Sprint, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sprintId' })
  sprint: Relation<Sprint> | null;

  @RelationId((task: Task) => task.sprint)
  sprintId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeId' })
  assignee: Relation<User> | null;

  @RelationId((task: Task) => task.assignee)
  assigneeId: number | null;

  projectName?: string;

  assigneeName?: string | null;
}
