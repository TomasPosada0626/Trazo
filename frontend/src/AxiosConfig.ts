// Author: Mateo Garcia Carreno

// external imports
import axios from 'axios';
import type { Router } from 'vue-router';

// internal imports
import { AuthService } from '@/services/AuthService';

export default class AxiosConfig {
  public static init(router: Router): void {
    // The backend has no session token: this header is how it knows who is
    // asking. Read on every request, so it can never fall out of step with
    // the signed-in user.
    axios.interceptors.request.use((config) => {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        config.headers.set('X-User-Id', String(currentUser.id));
      }

      return config;
    });

    // A 401 while signed in means the saved session names a user who no
    // longer exists, so the session is dropped instead of failing every call.
    axios.interceptors.response.use(undefined, async (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        AuthService.getCurrentUser()
      ) {
        AuthService.logout();
        await router.push({ name: 'login' });
      }

      throw error;
    });
  }
}
