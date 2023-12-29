import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';
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

  @Get("year-total")
  getyearAverage(@Query() body) {
    return this.transactionsService.getYearTotal(body)
  }

  @Get("overall-category-wise-debits")
  getMonthOverallCategoryWiseDebits(@Query() body) {
    return this.transactionsService.getMonthCategoryWiseDebits(body)
  }

  @Get("overall-category-wise")
  getMonthOverallCategoryWiseData(@Query() body) {
    return this.transactionsService.getMonthCategoryWiseOverallData(body)
  }

  @Get("category-month")
  getSingleCategoryMonthData(@Query() body) {
    return this.transactionsService.getSingleCategoryMonthData(body)
  }

  @Delete()
  deleteTransaction(@Query() body) {
    return this.transactionsService.deleteTransaction(body.type, body.id)
  }

}
