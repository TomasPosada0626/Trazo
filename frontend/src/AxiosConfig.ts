// Developed by Mateo Garcia Carreno

// External imports
import axios from 'axios';
import type { Router } from 'vue-router';

// Internal imports
import { AuthService } from '@/services/AuthService';

export default class AxiosConfig {
  public static init(router: Router): void {
    axios.interceptors.request.use((config) => {
      const token = AuthService.getAccessToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      return config;
    });

    axios.interceptors.response.use(undefined, async (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        AuthService.getLoggedInUser()
      ) {
        AuthService.logOutUser();
        await router.push({ name: 'login' });
      }

      throw error;
    });
  }
}
