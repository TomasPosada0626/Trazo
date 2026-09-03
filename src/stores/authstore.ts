import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const currentUserId = ref<number | null>(null);

  return { currentUserId };
});
