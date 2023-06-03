import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _auth_service: AuthService
  ) { }
  canActivate(
    context: ExecutionContext,
  ): any {
    try {
      const request = context.switchToHttp().getRequest()
      const token = request.headers.authorization
      const valid = this._auth_service.verifyToken(token)
      if (valid) {
        return true
      }
      throw new UnauthorizedException()
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
}
