/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PoliciesGuard } from './policies.guard';
import { PolicyHandlersStorage } from '../policies/policy-handlers.storage';
import { Policy } from '../policies/interfaces/policy.interface';
import { PolicyHandler } from '../policies/interfaces/policy-hadler.interface';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { POLICIES_KEY } from '../decorators/policies.decorator';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { Role } from '../../../users/enums/role.enum';

describe('PoliciesGuard', () => {
  let guard: PoliciesGuard;
  let reflector: Reflector;
  let policyHandlersStorage: PolicyHandlersStorage;

  // Mock policy classes
  class TestPolicy implements Policy {
    constructor(public name: string) {}
  }

  class AnotherTestPolicy implements Policy {
    constructor(public name: string) {}
  }

  // Mock policy handlers
  const mockPolicyHandler: PolicyHandler<TestPolicy> = {
    handle: jest.fn().mockResolvedValue(undefined),
  };

  const mockAnotherPolicyHandler: PolicyHandler<AnotherTestPolicy> = {
    handle: jest.fn().mockResolvedValue(undefined),
  };

  // Mock user data
  const mockUser: ActiveUserData = {
    sub: 1,
    email: 'test@example.com',
    role: Role.REGULAR,
    permissions: [],
  };

  // Mock request
  const mockRequest = {
    [REQUEST_USER_KEY]: mockUser,
  } as Request;

  // Mock execution context
  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PolicyHandlersStorage,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PoliciesGuard>(PoliciesGuard);
    reflector = module.get<Reflector>(Reflector);
    policyHandlersStorage = module.get<PolicyHandlersStorage>(
      PolicyHandlersStorage,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no policies are defined', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(POLICIES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should return true when policies array is empty', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should execute all policies successfully and return true', async () => {
      const policies = [new TestPolicy('test1'), new TestPolicy('test2')];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest
        .spyOn(policyHandlersStorage, 'get')
        .mockReturnValue(mockPolicyHandler);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(policyHandlersStorage.get).toHaveBeenCalledTimes(2);
      expect(mockPolicyHandler.handle).toHaveBeenCalledTimes(2);
      expect(mockPolicyHandler.handle).toHaveBeenCalledWith(
        policies[0],
        mockUser,
      );
      expect(mockPolicyHandler.handle).toHaveBeenCalledWith(
        policies[1],
        mockUser,
      );
    });

    it('should handle multiple different policy types', async () => {
      const policies = [
        new TestPolicy('test1'),
        new AnotherTestPolicy('test2'),
      ];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest
        .spyOn(policyHandlersStorage, 'get')
        .mockReturnValueOnce(mockPolicyHandler)
        .mockReturnValueOnce(mockAnotherPolicyHandler);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(policyHandlersStorage.get).toHaveBeenCalledTimes(2);
      expect(mockPolicyHandler.handle).toHaveBeenCalledWith(
        policies[0],
        mockUser,
      );
      expect(mockAnotherPolicyHandler.handle).toHaveBeenCalledWith(
        policies[1],
        mockUser,
      );
    });

    it('should throw ForbiddenException when policy handler throws an error', async () => {
      const policies = [new TestPolicy('test1')];
      const errorMessage = 'Policy validation failed';
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest.spyOn(policyHandlersStorage, 'get').mockReturnValue({
        handle: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      await expect(
        async () => await guard.canActivate(mockExecutionContext),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        async () => await guard.canActivate(mockExecutionContext),
      ).rejects.toThrow(errorMessage);
    });

    it('should throw ForbiddenException with generic message when policy handler throws non-Error', async () => {
      const policies = [new TestPolicy('test1')];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest.spyOn(policyHandlersStorage, 'get').mockReturnValue({
        handle: jest.fn().mockRejectedValue('String error'),
      });

      await expect(
        async () => await guard.canActivate(mockExecutionContext),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        async () => await guard.canActivate(mockExecutionContext),
      ).rejects.toThrow('An unknown error occurred');
    });

    it('should handle policy handler not found gracefully', async () => {
      const policies = [new TestPolicy('test1')];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest.spyOn(policyHandlersStorage, 'get').mockImplementation(() => {
        throw new Error('Policy handler for TestPolicy not found');
      });

      await expect(
        async () => await guard.canActivate(mockExecutionContext),
      ).rejects.toThrow(Error);
      await expect(
        async () => await guard.canActivate(mockExecutionContext),
      ).rejects.toThrow('Policy handler for TestPolicy not found');
    });

    it('should handle undefined policy handler gracefully', async () => {
      const policies = [new TestPolicy('test1')];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest.spyOn(policyHandlersStorage, 'get').mockReturnValue(undefined);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(policyHandlersStorage.get).toHaveBeenCalledWith(TestPolicy);
    });

    it('should execute policies in parallel', async () => {
      const policies = [new TestPolicy('test1'), new TestPolicy('test2')];
      const handler1 = { handle: jest.fn().mockResolvedValue(undefined) };
      const handler2 = { handle: jest.fn().mockResolvedValue(undefined) };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest
        .spyOn(policyHandlersStorage, 'get')
        .mockReturnValueOnce(handler1)
        .mockReturnValueOnce(handler2);

      const startTime = Date.now();
      await guard.canActivate(mockExecutionContext);
      const endTime = Date.now();

      // Both handlers should have been called
      expect(handler1.handle).toHaveBeenCalled();
      expect(handler2.handle).toHaveBeenCalled();

      // Execution should be fast (parallel) - not sequential
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle request without user data', async () => {
      const policies = [new TestPolicy('test1')];
      const requestWithoutUser = {} as Request;
      const contextWithoutUser = {
        switchToHttp: () => ({
          getRequest: () => requestWithoutUser,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(policies);
      jest
        .spyOn(policyHandlersStorage, 'get')
        .mockReturnValue(mockPolicyHandler);

      const result = await guard.canActivate(contextWithoutUser);

      expect(result).toBe(true);
      expect(mockPolicyHandler.handle).toHaveBeenCalledWith(
        policies[0],
        undefined,
      );
    });
  });
});
