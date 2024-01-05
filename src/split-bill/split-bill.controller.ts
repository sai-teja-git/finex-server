import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SplitBillService } from './split-bill.service';

@Controller('split-bill')
export class SplitBillController {
  constructor(private readonly splitBillService: SplitBillService) { }

  @Post("bill")
  insertNewBill(@Body() body) {
    return this.splitBillService.addBill(body)
  }

  @Post()
  insertNewGroup(@Body() body) {
    return this.splitBillService.insertNewGroup(body)
  }

  @Get()
  billGroups(@Query() params) {
    return this.splitBillService.getGroupData(params)
  }

  @Delete("/:id")
  deleteGroup(@Param() object) {
    return this.splitBillService.deleteGroup(object.id)
  }
}
