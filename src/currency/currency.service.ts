import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CURRENCY_TABLE, CurrencyModel } from './schemas/currency.schema';
import { Model } from 'mongoose';

@Injectable()
export class CurrencyService {

  constructor(
    @InjectModel(CURRENCY_TABLE) private currencyModel: Model<CurrencyModel>,
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
      return {
        data: await this.currencyModel.find().exec(),
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
