import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeZoneModule } from './time-zone/time-zone.module';
import { CurrencyModule } from './currency/currency.module';
import { MailService } from './common/services/mail/mail.service';
import { IconsModule } from './icons/icons.module';
import { ColorsModule } from './colors/colors.module';
import { CategoryModule } from './category/category.module';
import { UserCategoryModule } from './user-category/user-category.module';
import { env } from 'process';
import { TransactionsModule } from './transactions/transactions.module';
import { SplitBillModule } from './split-bill/split-bill.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: env.MONGO_DB_CLOUD_URL,
      }),
    }),
    UserModule,
    TimeZoneModule,
    CurrencyModule,
    IconsModule,
    ColorsModule,
    CategoryModule,
    UserCategoryModule,
    TransactionsModule,
    SplitBillModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule { }
