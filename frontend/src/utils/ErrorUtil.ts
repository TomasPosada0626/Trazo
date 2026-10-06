// Author: Mateo Garcia Carreno

// external imports
import axios from 'axios';

export class ErrorUtil {
  static getMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
      if (!error.response) return 'The server could not be reached.';

      // Validation failures arrive as a list of messages, broken business
      // rules as a single one.
      const message = error.response.data?.message;
      if (Array.isArray(message)) return message.join(' ');
      if (message) return message;
    }

    return fallback;
  }
}
