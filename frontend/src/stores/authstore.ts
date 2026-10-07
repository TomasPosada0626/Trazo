// Developed by Mateo Garcia Carreno

// External imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserInterface | null>(null);

  return { currentUser };
});
