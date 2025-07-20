import { TokenService } from 'src/iam/token/token.service';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    const mockTokenService = {} as TokenService;
    expect(new AccessTokenGuard(mockTokenService)).toBeDefined();
  });
});
