import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { UserInterface } from '@/interfaces/UserInterface';
import * as authService from '@/services/authService';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserInterface | null>(authService.getCurrentUser() ?? null);

  const isAuthenticated = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  function login(email: string, password: string): void {
    currentUser.value = authService.login(email, password);
  }

  function logout(): void {
    authService.logout();
    currentUser.value = null;
  }

  return { currentUser, isAuthenticated, isAdmin, login, logout };
});
