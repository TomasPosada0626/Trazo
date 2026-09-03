import type { UserInterface } from '@/interfaces/UserInterface';

/** Mock users preloaded on first load, per the MVP's LocalStorage-only scope. */
export const userSeeder: UserInterface[] = [
  {
    id: 1,
    name: 'Ana Duarte',
    email: 'admin@trazo.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 2,
    name: 'Maria Lopez',
    email: 'maria@trazo.com',
    password: 'member123',
    role: 'member',
  },
  {
    id: 3,
    name: 'Juan Perez',
    email: 'juan@trazo.com',
    password: 'admin123',
    role: 'admin',
  },
];
