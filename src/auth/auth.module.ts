import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist';

@Module({
  imports: [
    JwtModule.register({
      secret: "VkYp3s6v9y$B&E)H+MbQeThWmZq4t7w!z%C*F-JaNcRfUjXn2r5u8x/A?D(G+KbP",
      signOptions: { expiresIn: "30d" }
    })
  ],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule { }
