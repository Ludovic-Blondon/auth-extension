import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            refreshTokens: jest.fn(),
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

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
