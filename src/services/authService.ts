import type { UserInterface } from '@/interfaces/UserInterface';
import { STORAGE_KEYS, getAll, getItem, removeItem, seedIfEmpty, setItem } from '@/services/storageService';

interface Session {
  userId: string;
}

/** Mock users preloaded on first load, per the MVP's LocalStorage-only scope. */
const SEED_USERS: UserInterface[] = [
  { id: 'USR-01', name: 'Ana Duarte', email: 'admin@trazo.com', password: 'admin123', role: 'admin' },
  { id: 'USR-02', name: 'Maria Lopez', email: 'maria@trazo.com', password: 'member123', role: 'member' },
];

/** Seeds the mock users on first load only; does nothing if users already exist. */
export function seedUsers(): void {
  seedIfEmpty(STORAGE_KEYS.USERS, SEED_USERS);
}

/** Validates credentials and starts a session. Throws if they don't match a user. */
export function login(email: string, password: string): UserInterface {
  const user = getAll<UserInterface>(STORAGE_KEYS.USERS).find(
    (candidate) => candidate.email === email && candidate.password === password,
  );
  if (!user) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  setItem<Session>(STORAGE_KEYS.SESSION, { userId: user.id });
  return user;
}

/** Ends the active session. */
export function logout(): void {
  removeItem(STORAGE_KEYS.SESSION);
}

/** Returns the currently logged-in user, or `undefined` if there's no active session. */
export function getCurrentUser(): UserInterface | undefined {
  const session = getItem<Session>(STORAGE_KEYS.SESSION);
  if (!session) return undefined;

  return getAll<UserInterface>(STORAGE_KEYS.USERS).find((user) => user.id === session.userId);
}
