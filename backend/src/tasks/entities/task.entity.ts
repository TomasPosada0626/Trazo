// Developed by Mateo Garcia Carreno

// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

// Internal imports
import { Project } from '../../projects/entities/project.entity.js';
import { Sprint } from '../../sprints/entities/sprint.entity.js';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from '../../types/TasksTypes.js';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
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

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

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
