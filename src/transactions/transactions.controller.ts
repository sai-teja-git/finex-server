import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post("/:type")
  @UseGuards(AuthGuard)
  insertTransaction(@Headers() headers, @Param() object, @Body() body) {
    return this.transactionsService.insertTransaction(headers.user, object.type, body)
  }

  @Patch()
  @UseGuards(AuthGuard)
  updateTransaction(@Query() params, @Body() body) {
    return this.transactionsService.updateTransaction(params.type, params.id, body)
  }

  @Get("overall")
  @UseGuards(AuthGuard)
  getMonthOverallData(@Headers() headers, @Query() body) {
    return this.transactionsService.getOverallSpendsBetween(headers.user, body)
  }

  @Get("overall-category-wise-debits")
  @UseGuards(AuthGuard)
  getMonthOverallCategoryWiseDebits(@Headers() headers, @Query() body) {
    return this.transactionsService.getMonthCategoryWiseDebits(headers.user, body)
  }

  @Get("overall-category-wise")
  @UseGuards(AuthGuard)
  getMonthOverallCategoryWiseData(@Headers() headers, @Query() body) {
    return this.transactionsService.getMonthCategoryWiseOverallData(headers.user, body)
  }

  @Get("category-month")
  @UseGuards(AuthGuard)
  getSingleCategoryMonthData(@Query() body) {
    return this.transactionsService.getSingleCategoryMonthData(body)
  }

  @Delete()
  @UseGuards(AuthGuard)
  deleteTransaction(@Query() body) {
    return this.transactionsService.deleteTransaction(body.type, body.id)
  }

}
