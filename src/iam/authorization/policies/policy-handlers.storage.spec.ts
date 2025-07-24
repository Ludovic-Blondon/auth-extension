/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { PolicyHandlersStorage } from './policy-handlers.storage';
import { Policy } from './interfaces/policy.interface';
import { PolicyHandler } from './interfaces/policy-hadler.interface';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';

// Mock classes for testing
class MockPolicy implements Policy {
  constructor(public name: string) {}
}

class MockPolicyHandler implements PolicyHandler<MockPolicy> {
  async handle(policy: MockPolicy, user: ActiveUserData): Promise<void> {
    // Mock implementation
  }
}

class AnotherMockPolicy implements Policy {
  constructor(public name: string) {}
}

class AnotherMockPolicyHandler implements PolicyHandler<AnotherMockPolicy> {
  async handle(policy: AnotherMockPolicy, user: ActiveUserData): Promise<void> {
    // Mock implementation
  }
}

describe('PolicyHandlersStorage', () => {
  let storage: PolicyHandlersStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolicyHandlersStorage],
    }).compile();

    storage = module.get<PolicyHandlersStorage>(PolicyHandlersStorage);
  });

  describe('add', () => {
    it('should add a policy handler to the collection', () => {
      const policy = MockPolicy;
      const handler = new MockPolicyHandler();

      storage.add(policy, handler);

      // Verify the handler was added by trying to get it
      expect(() => storage.get(policy)).not.toThrow();
    });

    it('should overwrite existing handler when adding same policy class', () => {
      const policy = MockPolicy;
      const handler1 = new MockPolicyHandler();
      const handler2 = new MockPolicyHandler();

      storage.add(policy, handler1);
      storage.add(policy, handler2);

      const retrievedHandler = storage.get(policy);
      expect(retrievedHandler).toBe(handler2);
    });

    it('should handle multiple different policy classes', () => {
      const policy1 = MockPolicy;
      const policy2 = AnotherMockPolicy;
      const handler1 = new MockPolicyHandler();
      const handler2 = new AnotherMockPolicyHandler();

      storage.add(policy1, handler1);
      storage.add(policy2, handler2);

      expect(storage.get(policy1)).toBe(handler1);
      expect(storage.get(policy2)).toBe(handler2);
    });
  });

  describe('get', () => {
    it('should return the correct handler for an existing policy', () => {
      const policy = MockPolicy;
      const handler = new MockPolicyHandler();

      storage.add(policy, handler);
      const retrievedHandler = storage.get(policy);

      expect(retrievedHandler).toBe(handler);
    });

    it('should throw an error when policy handler is not found', () => {
      const policy = MockPolicy;

      expect(() => storage.get(policy)).toThrow(
        `Policy handler for ${policy.name} not found`,
      );
    });

    it('should throw an error with correct policy name in error message', () => {
      const policy = AnotherMockPolicy;

      expect(() => storage.get(policy)).toThrow(
        `Policy handler for ${policy.name} not found`,
      );
    });

    it('should maintain separate collections for different instances', async () => {
      const module2: TestingModule = await Test.createTestingModule({
        providers: [PolicyHandlersStorage],
      }).compile();

      const storage2 = module2.get<PolicyHandlersStorage>(
        PolicyHandlersStorage,
      );
      const policy = MockPolicy;
      const handler = new MockPolicyHandler();

      // Add handler to first storage
      storage.add(policy, handler);

      // Second storage should not have the handler
      expect(() => storage2.get(policy)).toThrow(
        `Policy handler for ${policy.name} not found`,
      );

      // First storage should still have the handler
      expect(storage.get(policy)).toBe(handler);
    });
  });

  describe('integration', () => {
    it('should work correctly with add and get operations', () => {
      const policy1 = MockPolicy;
      const policy2 = AnotherMockPolicy;
      const handler1 = new MockPolicyHandler();
      const handler2 = new AnotherMockPolicyHandler();

      // Add handlers
      storage.add(policy1, handler1);
      storage.add(policy2, handler2);

      // Retrieve handlers
      expect(storage.get(policy1)).toBe(handler1);
      expect(storage.get(policy2)).toBe(handler2);

      // Verify non-existent policy throws error
      const nonExistentPolicy = class NonExistentPolicy implements Policy {
        name = 'NonExistentPolicy';
      };

      expect(() => storage.get(nonExistentPolicy)).toThrow(
        `Policy handler for NonExistentPolicy not found`,
      );
    });
  });
});
