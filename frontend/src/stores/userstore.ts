// Author: Tomás Posada

// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

export const useUserStore = defineStore('user', () => {
  const users = ref<UserInterface[]>([]);

  return { users };
});
