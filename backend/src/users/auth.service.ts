import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ENV } from 'src/common/constants';

export interface IAuthService {
  hashPassword(plainTextPassword: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(private readonly configService: ConfigService) {}
  async hashPassword(plainTextPassword: string): Promise<string> {
    const saltRounds = Number(this.configService.get(ENV.SALT_ROUNDS));

    if (!saltRounds || saltRounds <= 0) {
      Logger.error(
        'SALT_ROUNDS environment variable is not configured correctly.',
      );
      throw new InternalServerErrorException('Server configuration error.');
    }

    try {
      const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
      return hashedPassword;
    } catch (error) {
      Logger.error('Critical error during password hashing:', error);
      throw new BadRequestException('Password hashing failed.');
    }
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      Logger.error('Error during password verification:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during authentication.',
      );
    }
  }
}
