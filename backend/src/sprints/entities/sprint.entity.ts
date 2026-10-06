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
import {
  SPRINT_STATUSES,
  type SprintStatus,
} from '../../types/SprintsTypes.js';

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  goal: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'simple-enum', enum: SPRINT_STATUSES })
  status: SprintStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Relation<Project>;

  @RelationId((sprint: Sprint) => sprint.project)
  projectId: number;

  committedPoints?: number;

  completedPoints?: number;

  taskCount?: number;

  remainingDays?: number;
}
