// Developed by Mateo Garcia Carreno

// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

// Internal imports
import { Project } from '../../projects/entities/project.entity.js';
import { USER_ROLES, type UserRole } from '../../types/UsersTypes.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'simple-enum', enum: USER_ROLES })
  role: UserRole;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToMany(() => Project, (project) => project.users)
  projects: Relation<Project[]>;

  activeProjects?: number;
}
