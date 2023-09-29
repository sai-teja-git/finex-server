import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, USER_TABLE } from './schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { UserCategoryModule } from 'src/user-category/user-category.module';
import { MailService } from 'src/common/services/mail/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_TABLE, schema: UserSchema }]),
    AuthModule,
    forwardRef(() => CategoryModule),
    forwardRef(() => UserCategoryModule)
  ],
  controllers: [UserController],
  providers: [
    UserService,
    MailService
  ]
})
export class UserModule { }
