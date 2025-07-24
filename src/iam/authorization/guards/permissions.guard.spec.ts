import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../../../iam/iam.constants';
import { CoffeesPermission } from '../../../coffees/coffees.permission';

describe('PermissionsGuard', () => {
  it('should be defined', () => {
    expect(new PermissionsGuard(new Reflector())).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return true if the user has the role', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValue([CoffeesPermission.CREATE]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_USER_KEY]: { permissions: [CoffeesPermission.CREATE] },
          }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(true);
    });

    it('should return false if the user does not have the role', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValue([CoffeesPermission.CREATE]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_USER_KEY]: { permissions: [CoffeesPermission.READ] },
          }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(false);
    });

    it('should return true when no roles are defined', () => {
      const reflector = {
        getAllAndOverride: jest.fn().mockReturnValue(undefined),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_USER_KEY]: { permissions: [CoffeesPermission.CREATE] },
          }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when no roles are defined and user is undefined', () => {
      const reflector = {
        getAllAndOverride: jest.fn().mockReturnValue(undefined),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ [REQUEST_USER_KEY]: undefined }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple required roles', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValue([CoffeesPermission.CREATE, CoffeesPermission.READ]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_USER_KEY]: { permissions: [CoffeesPermission.READ] },
          }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(true);
    });

    it('should return false when user has none of the required roles', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValue([CoffeesPermission.CREATE]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_USER_KEY]: { permissions: [CoffeesPermission.READ] },
          }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(false);
    });

    it('should return false when user is undefined but roles are required', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValue([CoffeesPermission.CREATE]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ [REQUEST_USER_KEY]: undefined }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(false);
    });

    it('should return false when user object is missing from request', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValue([CoffeesPermission.CREATE]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(false);
    });

    it('should handle empty roles array', () => {
      const reflector = {
        getAllAndOverride: jest.fn().mockReturnValue([]),
      } as unknown as Reflector;
      const context = {
        getClass: () => ({}),
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_USER_KEY]: { permissions: [CoffeesPermission.CREATE] },
          }),
        }),
      } as ExecutionContext;
      const result = new PermissionsGuard(reflector).canActivate(context);
      expect(result).toBe(false);
    });
  });
});
