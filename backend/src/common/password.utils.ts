// Developed by Hever-Alfonso

// External imports
import bcrypt from 'bcrypt';

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 10;

  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, PasswordUtils.SALT_ROUNDS);
  }

  static async matches(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
