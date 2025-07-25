import { Injectable } from '@nestjs/common';
import { PolicyHandler } from './interfaces/policy-hadler.interface';
import { Policy } from './interfaces/policy.interface';
import { Type } from '@nestjs/common';

@Injectable()
export class PolicyHandlersStorage {
  private readonly collection = new Map<Type<Policy>, PolicyHandler<any>>();

  add<T extends Policy>(policyCls: Type<T>, handler: PolicyHandler<T>) {
    this.collection.set(policyCls, handler);
  }

  get<T extends Policy>(policyCls: Type<T>): PolicyHandler<T> | undefined {
    const handler = this.collection.get(policyCls);

    if (!handler) {
      throw new Error(`Policy handler for ${policyCls.name} not found`);
    }

    return handler;
  }
}
