// Developed by Mateo Garcia Carreno

// External imports
import axios from 'axios';

export class ErrorUtil {
  static getMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
      if (!error.response) return 'The server could not be reached.';

      const message = error.response.data?.message;
      if (Array.isArray(message)) return message.join(' ');
      if (message) return message;
    }

    return fallback;
  }
}
