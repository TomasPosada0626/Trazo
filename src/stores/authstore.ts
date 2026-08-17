import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const currentUserId = ref<string | null>(null);

  return { currentUserId };
});
