// Author: Mateo Garcia Carreno

// external imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import type { Relation } from 'typeorm';

// internal imports
import { User } from '../../users/entities/user.entity.js';

export const PROJECT_STATUSES = [
  'planning',
  'active',
  'at_risk',
  'paused',
  'completed',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-enum', enum: PROJECT_STATUSES })
  status: ProjectStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_users',
    joinColumn: { name: 'projectId' },
    inverseJoinColumn: { name: 'userId' },
  })
  users: Relation<User[]>;

  @RelationId((project: Project) => project.users)
  userIds: number[];
}
