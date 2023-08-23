import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CURRENCY_TABLE, CurrencySchema } from './schemas/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CURRENCY_TABLE, schema: CurrencySchema }])
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService]
})
export class CurrencyModule { }
