import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import {
  FrameworkContributorPolicy,
  FrameworkContributorPolicyHandler,
} from './framework-contributor.policy';
import { PolicyHandlersStorage } from './policy-handlers.storage';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { Role } from '../../../users/enums/role.enum';
import { CoffeesPermission } from '../../../coffees/coffees.permission';

describe('FrameworkContributorPolicy', () => {
  let policy: FrameworkContributorPolicy;

  beforeEach(() => {
    policy = new FrameworkContributorPolicy();
  });

  describe('Policy class', () => {
    it('should have the correct name', () => {
      expect(policy.name).toBe('frameworkContributor');
    });

    it('should be an instance of FrameworkContributorPolicy', () => {
      expect(policy).toBeInstanceOf(FrameworkContributorPolicy);
    });
  });
});

describe('FrameworkContributorPolicyHandler', () => {
  let handler: FrameworkContributorPolicyHandler;
  let mockPolicyHandlersStorage: jest.Mocked<
    Pick<PolicyHandlersStorage, 'add' | 'get'>
  >;

  beforeEach(async () => {
    mockPolicyHandlersStorage = {
      add: jest.fn(),
      get: jest.fn(),
    } as jest.Mocked<Pick<PolicyHandlersStorage, 'add' | 'get'>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FrameworkContributorPolicyHandler,
        {
          provide: PolicyHandlersStorage,
          useValue: mockPolicyHandlersStorage,
        },
      ],
    }).compile();

    handler = module.get<FrameworkContributorPolicyHandler>(
      FrameworkContributorPolicyHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should register itself in the policy handlers storage', () => {
      expect(mockPolicyHandlersStorage.add).toHaveBeenCalledWith(
        FrameworkContributorPolicy,
        handler,
      );
    });
  });

  describe('handle', () => {
    const mockUser: ActiveUserData = {
      sub: 1,
      email: 'test@example.com',
      role: Role.REGULAR,
      permissions: [],
    };

    const policy = new FrameworkContributorPolicy();

    it('should allow access for users with @gmail.com email', async () => {
      const gmailUser: ActiveUserData = {
        ...mockUser,
        email: 'contributor@gmail.com',
      };

      await expect(handler.handle(policy, gmailUser)).resolves.not.toThrow();
    });

    it('should throw ForbiddenException for users with uppercase @gmail.com email (case sensitive)', async () => {
      const gmailUser: ActiveUserData = {
        ...mockUser,
        email: 'CONTRIBUTOR@GMAIL.COM',
      };

      await expect(handler.handle(policy, gmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for users with mixed case @gmail.com email (case sensitive)', async () => {
      const gmailUser: ActiveUserData = {
        ...mockUser,
        email: 'Contributor@Gmail.com',
      };

      await expect(handler.handle(policy, gmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for users with non-gmail email', async () => {
      const nonGmailUser: ActiveUserData = {
        ...mockUser,
        email: 'user@example.com',
      };

      await expect(handler.handle(policy, nonGmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for users with @gmail.co.uk email', async () => {
      const nonGmailUser: ActiveUserData = {
        ...mockUser,
        email: 'user@gmail.co.uk',
      };

      await expect(handler.handle(policy, nonGmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for users with @googlemail.com email', async () => {
      const nonGmailUser: ActiveUserData = {
        ...mockUser,
        email: 'user@googlemail.com',
      };

      await expect(handler.handle(policy, nonGmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for users with empty email', async () => {
      const emptyEmailUser: ActiveUserData = {
        ...mockUser,
        email: '',
      };

      await expect(handler.handle(policy, emptyEmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException for users with email containing @gmail.com but not ending with it', async () => {
      const invalidEmailUser: ActiveUserData = {
        ...mockUser,
        email: 'fake@gmail.com.fake',
      };

      await expect(handler.handle(policy, invalidEmailUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle email with subdomain correctly', async () => {
      const subdomainUser: ActiveUserData = {
        ...mockUser,
        email: 'user.subdomain@gmail.com',
      };

      await expect(
        handler.handle(policy, subdomainUser),
      ).resolves.not.toThrow();
    });

    it('should handle email with numbers correctly', async () => {
      const numberEmailUser: ActiveUserData = {
        ...mockUser,
        email: 'user123@gmail.com',
      };

      await expect(
        handler.handle(policy, numberEmailUser),
      ).resolves.not.toThrow();
    });

    it('should handle email with special characters correctly', async () => {
      const specialCharUser: ActiveUserData = {
        ...mockUser,
        email: 'user-name+tag@gmail.com',
      };

      await expect(
        handler.handle(policy, specialCharUser),
      ).resolves.not.toThrow();
    });

    it('should work with different user roles', async () => {
      const adminGmailUser: ActiveUserData = {
        ...mockUser,
        email: 'admin@gmail.com',
        role: Role.ADMIN,
      };

      await expect(
        handler.handle(policy, adminGmailUser),
      ).resolves.not.toThrow();
    });

    it('should work with different user IDs', async () => {
      const differentUser: ActiveUserData = {
        ...mockUser,
        sub: 999,
        email: 'different@gmail.com',
      };

      await expect(
        handler.handle(policy, differentUser),
      ).resolves.not.toThrow();
    });

    it('should work with users having different permissions', async () => {
      const userWithPermissions: ActiveUserData = {
        ...mockUser,
        email: 'permissioned@gmail.com',
        permissions: [CoffeesPermission.CREATE, CoffeesPermission.READ],
      };

      await expect(
        handler.handle(policy, userWithPermissions),
      ).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    const policy = new FrameworkContributorPolicy();

    it('should handle very long gmail addresses', async () => {
      const longEmailUser: ActiveUserData = {
        sub: 1,
        email: 'a'.repeat(50) + '@gmail.com',
        role: Role.REGULAR,
        permissions: [],
      };

      await expect(
        handler.handle(policy, longEmailUser),
      ).resolves.not.toThrow();
    });

    it('should handle email with multiple @ symbols before gmail.com', async () => {
      const multipleAtUser: ActiveUserData = {
        sub: 1,
        email: 'user@domain@gmail.com',
        role: Role.REGULAR,
        permissions: [],
      };

      await expect(
        handler.handle(policy, multipleAtUser),
      ).resolves.not.toThrow();
    });

    it('should allow access for users with email containing spaces before @gmail.com', async () => {
      const spacedEmailUser: ActiveUserData = {
        sub: 1,
        email: 'user @gmail.com',
        role: Role.REGULAR,
        permissions: [],
      };

      await expect(
        handler.handle(policy, spacedEmailUser),
      ).resolves.not.toThrow();
    });
  });
});
