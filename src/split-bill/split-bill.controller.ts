import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SplitBillService } from './split-bill.service';

@Controller('split-bill')
export class SplitBillController {
  constructor(private readonly splitBillService: SplitBillService) { }

  @Post("bill")
  insertNewBill(@Body() body) {
    return this.splitBillService.addBill(body)
  }

  @Post("group/person/:id")
  addNewPerson(@Param() object, @Body() body) {
    return this.splitBillService.addPersonToGroup(object.id, body)
  }

  @Post()
  insertNewGroup(@Body() body) {
    return this.splitBillService.insertNewGroup(body)
  }

  @Delete("bill/:id")
  deleteBill(@Param() object) {
    return this.splitBillService.deleteBill(object.id)
  }

  @Patch("person-details")
  updatePersonDetails(@Body() body) {
    return this.splitBillService.updatePersonDetails(body)
  }

  @Patch("bill/:id")
  updateBill(@Param() object, @Body() body) {
    return this.splitBillService.updateBill(object.id, body)
  }

  @Patch("/:id")
  updateGroup(@Param() object, @Body() body) {
    return this.splitBillService.updateGroup(object.id, body)
  }

  @Get("group/:id")
  groupOverall(@Param() object) {
    return this.splitBillService.getGroupOverallValues(object.id)
  }

  @Get("person-wise/:id")
  getPersonWiseBills(@Param() object) {
    return this.splitBillService.getPersonWiseBillDetails(object.id)
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
