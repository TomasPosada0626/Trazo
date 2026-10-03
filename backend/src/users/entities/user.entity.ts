// Author: Mateo Garcia Carreno

// external imports
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';

// internal imports
import { Project } from '../../projects/entities/project.entity.js';

export const USER_ROLES = ['admin', 'member'] as const;

export type UserRole = (typeof USER_ROLES)[number];

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'simple-enum', enum: USER_ROLES })
  role: UserRole;

  @ManyToMany(() => Project, (project) => project.users)
  projects: Relation<Project[]>;
}
