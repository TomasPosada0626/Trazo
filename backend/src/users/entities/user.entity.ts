// Author: Mateo Garcia Carreno

// external imports
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
