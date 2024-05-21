import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
  ) { }

  /**
   * The function `canActivate` in TypeScript checks for a valid authorization token in the request
   * headers and verifies it using JWT, setting the username and user in the request headers if
   * successful.
   * @param {ExecutionContext} context - The `context` parameter in the `canActivate` method represents
   * the execution context of a given request. It provides access to the current request and response
   * objects, among other things, allowing you to inspect and manipulate the incoming request.
   * @returns The `canActivate` function is returning a Promise that resolves to a boolean value. If
   * the function successfully verifies the JWT token and extracts the payload, it will return `true`.
   * Otherwise, if there is an error during the process, it will throw an `UnauthorizedException` with
   * the error message.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest()
      const token = request.headers.authorization
      if (!token) throw new UnauthorizedException();
      const jwt = token.split(" ")[1]

      const payload = await this.jwtService.verifyAsync(jwt)
      if (!payload) throw new UnauthorizedException()
      request['headers']['username'] = payload['username']
      request['headers']['user'] = payload['user']
      return true
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
}
