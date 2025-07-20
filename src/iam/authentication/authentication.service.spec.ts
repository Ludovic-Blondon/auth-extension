/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { HashingService } from '../hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { TokenService } from '../token/token.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
        {
          provide: RefreshTokenIdsStorage,
          useValue: {
            insert: jest.fn(),
            validate: jest.fn(),
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a user', async () => {
      await service.signUp({
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('signup with conflict', async () => {
      const userRepository = module.get(getRepositoryToken(User));

      const findOneMock = userRepository.findOne as jest.Mock;
      findOneMock.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      await expect(
        service.signUp({
          email: 'test@test.com',
          password: 'password',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const userRepository = module.get(getRepositoryToken(User));

      const findOneMock = userRepository.findOne as jest.Mock;
      findOneMock.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed-password',
      });

      const hashingService = module.get(HashingService);

      const compareMock = hashingService.compare as jest.Mock;
      compareMock.mockResolvedValue(true);

      const tokenService = module.get(TokenService);

      const generateAccessTokenMock =
        tokenService.generateAccessToken as jest.Mock;

      const generateRefreshTokenMock =
        tokenService.generateRefreshToken as jest.Mock;

      generateAccessTokenMock.mockResolvedValue('access-token');

      generateRefreshTokenMock.mockResolvedValue('refresh-token');

      const refreshTokenIdsStorage = module.get(RefreshTokenIdsStorage);

      const insertMock = refreshTokenIdsStorage.insert as jest.Mock;
      insertMock.mockResolvedValue(undefined);

      const result = await service.signIn({
        email: 'test@test.com',
        password: 'password',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw an error if the user does not exist', async () => {
      const userRepository = module.get(getRepositoryToken(User));

      const findOneMock = userRepository.findOne as jest.Mock;
      findOneMock.mockResolvedValue(null);

      await expect(
        service.signIn({
          email: 'test@test.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      // Mock the token service to verify refresh token and generate new tokens
      const tokenService = module.get(TokenService);
      const verifyRefreshTokenMock =
        tokenService.verifyRefreshToken as jest.Mock;
      const generateAccessTokenMock =
        tokenService.generateAccessToken as jest.Mock;
      const generateRefreshTokenMock =
        tokenService.generateRefreshToken as jest.Mock;

      verifyRefreshTokenMock.mockResolvedValue({
        sub: 1,
        refreshTokenId: 'token-id',
      });
      generateAccessTokenMock.mockResolvedValue('new-access-token');
      generateRefreshTokenMock.mockResolvedValue('new-refresh-token');

      // Mock the user repository to return a user
      const userRepository = module.get(getRepositoryToken(User));
      const findOneOrFailMock = userRepository.findOneOrFail as jest.Mock;
      findOneOrFailMock.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      // Mock the refresh token storage to validate and invalidate
      const refreshTokenIdsStorage = module.get(RefreshTokenIdsStorage);
      const validateMock = refreshTokenIdsStorage.validate as jest.Mock;
      const invalidateMock = refreshTokenIdsStorage.invalidate as jest.Mock;
      const insertMock = refreshTokenIdsStorage.insert as jest.Mock;

      validateMock.mockResolvedValue(true);
      invalidateMock.mockResolvedValue(undefined);
      insertMock.mockResolvedValue(undefined);

      const result = await service.refreshTokens({
        refreshToken: 'refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw an error if the refresh token is invalid', async () => {
      const tokenService = module.get(TokenService);
      const verifyRefreshTokenMock =
        tokenService.verifyRefreshToken as jest.Mock;
      verifyRefreshTokenMock.mockRejectedValue(new UnauthorizedException());

      await expect(
        service.refreshTokens({
          refreshToken: 'invalid-token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateTokens', () => {
    it('should generate tokens', async () => {
      // Mock the token service to generate tokens
      const tokenService = module.get(TokenService);
      const generateAccessTokenMock =
        tokenService.generateAccessToken as jest.Mock;
      const generateRefreshTokenMock =
        tokenService.generateRefreshToken as jest.Mock;

      generateAccessTokenMock.mockResolvedValue('access-token');
      generateRefreshTokenMock.mockResolvedValue('refresh-token');

      // Mock the refresh token storage to insert the token ID
      const refreshTokenIdsStorage = module.get(RefreshTokenIdsStorage);
      const insertMock = refreshTokenIdsStorage.insert as jest.Mock;
      insertMock.mockResolvedValue(undefined);

      const result = await service.generateTokens({
        id: 1,
        email: 'test@test.com',
        password: 'hashed-password',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
