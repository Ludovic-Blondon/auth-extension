import { Module } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      useFactory: (redisService: RedisService) => redisService.getClient(),
      inject: [RedisService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
