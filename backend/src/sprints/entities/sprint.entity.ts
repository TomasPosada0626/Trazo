// Author: Mateo Garcia Carreno

// external imports
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import type { Relation } from 'typeorm';

// internal imports
import { Project } from '../../projects/entities/project.entity.js';

export const SPRINT_STATUSES = ['planned', 'active', 'completed'] as const;

export type SprintStatus = (typeof SPRINT_STATUSES)[number];

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  goal: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'simple-enum', enum: SPRINT_STATUSES })
  status: SprintStatus;

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
