import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Post()
  @UseGuards(AuthGuard)
  insertCurrencyData(@Body() body) {
    return this.currencyService.insertCurrencyData(body)
  }

  @Get()
  @UseGuards(AuthGuard)
  getAllCurrency() {
    return this.currencyService.getAllCurrency()
  }

}
