// Developed by Mateo Garcia Carreno

// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

// Internal imports
import {
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../../types/ProjectsTypes.js';
import { Task } from '../../tasks/entities/task.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-enum', enum: PROJECT_STATUSES })
  status: ProjectStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable({
    name: 'project_users',
    joinColumn: { name: 'projectId' },
    inverseJoinColumn: { name: 'userId' },
  })
  users: Relation<User[]>;

  @RelationId((project: Project) => project.users)
  userIds: number[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Relation<Task[]>;

  progress?: number;

  taskCount?: number;
}
