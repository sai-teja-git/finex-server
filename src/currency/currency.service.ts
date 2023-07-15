import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CURRENCY_TABLE } from './currency.schema';
import { Currency } from './currency.interface';
import { Model } from 'mongoose';

@Injectable()
export class CurrencyService {

  constructor(
    @InjectModel(CURRENCY_TABLE) private currencyModel: Model<Currency>,
  ) { }

  async insertCurrencyData(body: any) {
    try {
      await this.currencyModel.insertMany(body.data)
      return {
        message: "Time Zone Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  async getAllCurrency() {
    try {
      return this.currencyModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
