import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post("/:type")
  insertTransaction(@Param() object, @Body() body) {
    return this.transactionsService.insertTransaction(object.type, body)
  }

  @Patch("/:type")
  updateTransaction(@Param() object, @Body() body) {
    return this.transactionsService.updateTransaction(object.type, body.id, body.data)
  }

  @Get("overall")
  getMonthOverallData(@Query() body) {
    return this.transactionsService.getOverallSpendsBetween(body)
  }

}
