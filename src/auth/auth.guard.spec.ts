import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
    authService = new AuthService(jwtService);
  });

  it('should be defined', () => {
    expect(new AuthGuard(authService)).toBeDefined();
  });

});
