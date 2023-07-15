import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Post()
  insertTimeZoneData(@Body() body) {
    return this.currencyService.insertCurrencyData(body)
  }

  @Get()
  getTimeZones() {
    return this.currencyService.getAllCurrency()
  }

}
