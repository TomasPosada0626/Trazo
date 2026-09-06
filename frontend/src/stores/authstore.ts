// Author: Mateo Garcia Carreno

// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // reactive variables
  const currentUserId = ref<number | null>(null);

  return { currentUserId };
});
