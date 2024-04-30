import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { env } from 'process';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { ColorsModule } from './colors/colors.module';
import { CurrencyModule } from './currency/currency.module';
import { IconsModule } from './icons/icons.module';
import { SplitBillModule } from './split-bill/split-bill.module';
import { TimeZoneModule } from './time-zone/time-zone.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UserCategoryModule } from './user-category/user-category.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET_KEY,
      signOptions: { expiresIn: env.JWT_TOKEN_LIFE }
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
  providers: [AppService],
  exports: [],
})
export class AppModule { }
