import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENV, TYPES } from 'src/common/constants';
import { logError } from 'src/common/utils';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { Repository } from 'typeorm';
import { IAuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/common/result';
import { Audit } from 'src/common/audit';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<Result<ICreateUserResponseDTO>>;
  signIn(createUserDto: CreateUserDto): Promise<Result<string>>;
  getUserByName(email: string): Promise<User | null>;
}

export interface ICreateUserResponseDTO {
  email: string;
  auditCreatedDateTime: string;
  username: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(TYPES.IAuthService) private readonly authService: IAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Result<ICreateUserResponseDTO>> {
    try {
      const { email, password, username } = createUserDto;
      const existingUser = await this.getUserByName(email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }
      const hash: string = await this.authService.hashPassword(password);
      const audit = Audit.create({
        auditCreatedBy: email,
        auditCreatedDateTime: new Date().toISOString(),
      });
      const user: User = this.userRepository.create({
        username,
        email,
        passwordHash: hash,
        auditCreatedBy: audit.auditCreatedBy,
        auditCreatedDateTime: audit.auditCreatedDateTime,
      });

      const result = await this.userRepository.save(user);
      return Result.ok({
        username: result.username,
        email: result.email,
        auditCreatedDateTime: result.auditCreatedDateTime,
      });
    } catch (error) {
      logError(error, UsersService.name);
      throw error;
    }
  }

  async signIn(
    createUserDto: CreateUserDto,
  ): Promise<Result<{ accessToken: string }>> {
    try {
      const { email, password } = createUserDto;
      const user = await this.getUserByName(email);

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      const validatePassword = await this.authService.verifyPassword(
        password,
        user.passwordHash,
      );

      if (!validatePassword) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const payload: JwtPayload = { sub: user.id, email: user.email };
      const secret = (await this.configService.get(ENV.JWT_SECRET)) as string;
      const options = { secret };
      const accessToken = await this.jwtService.signAsync(payload, options);
      return Result.ok({
        email: user.email,
        username: user.username,
        accessToken,
      });
    } catch (error) {
      logError(error, UsersService.name);
      throw error;
    }
  }

  async getUserByName(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }
}
