import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from 'src/category/category.module';
import { NotificationService } from 'src/common/services/notification.service';
import { CurrencyModule } from 'src/currency/currency.module';
import { TimeZoneModule } from 'src/time-zone/time-zone.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { UserCategoryModule } from 'src/user-category/user-category.module';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { USER_TABLE, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_TABLE, schema: UserSchema }]),
    forwardRef(() => CategoryModule),
    forwardRef(() => UserCategoryModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => TimeZoneModule),
    forwardRef(() => CurrencyModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    PasswordService,
    NotificationService,
  ]
})
export class UserModule { }
