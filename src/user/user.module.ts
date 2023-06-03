import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, USER_TABLE } from './user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: USER_TABLE, schema: UserSchema }])
  ],
  controllers: [UserController],
  providers: [
    UserService
  ]
})
export class UserModule { }
