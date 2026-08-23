import type { UserInterface } from '@/interfaces/UserInterface';

/** Mock users preloaded on first load, per the MVP's LocalStorage-only scope. */
export const userSeeder: UserInterface[] = [
  {
    id: 'USR-01',
    name: 'Ana Duarte',
    email: 'admin@trazo.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'USR-02',
    name: 'Maria Lopez',
    email: 'maria@trazo.com',
    password: 'member123',
    role: 'member',
  },
];
