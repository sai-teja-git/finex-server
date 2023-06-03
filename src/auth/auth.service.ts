import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private jwt_service: JwtService
    ) { }

    generateToken(body: any, expiryInSec: number = (10 * 60)) {
        return this.jwt_service.sign(body, { expiresIn: String(expiryInSec * 1000) })
    }

    verifyToken(token) {
        return this.jwt_service.verify(token)
    }

}
