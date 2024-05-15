import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { SplitBillService } from './split-bill.service';

@Controller('split-bill')
export class SplitBillController {
  constructor(private readonly splitBillService: SplitBillService) { }

  @Post("bill")
  @UseGuards(AuthGuard)
  insertNewBill(@Body() body) {
    return this.splitBillService.addBill(body)
  }

  @Post("group/person/:id")
  @UseGuards(AuthGuard)
  addNewPerson(@Param() object, @Body() body) {
    return this.splitBillService.addPersonToGroup(object.id, body)
  }

  @Post()
  @UseGuards(AuthGuard)
  insertNewGroup(@Headers() headers, @Body() body) {
    return this.splitBillService.insertNewGroup(headers.user, body)
  }

  @Patch("person-details")
  @UseGuards(AuthGuard)
  updatePersonDetails(@Body() body) {
    return this.splitBillService.updatePersonDetails(body)
  }

  @Patch("bill/:id")
  @UseGuards(AuthGuard)
  updateBill(@Param() object, @Body() body) {
    return this.splitBillService.updateBill(object.id, body)
  }

  @Patch("/:id")
  @UseGuards(AuthGuard)
  updateGroup(@Param() object, @Body() body) {
    return this.splitBillService.updateGroup(object.id, body)
  }

  @Get("group/:id")
  @UseGuards(AuthGuard)
  groupOverall(@Param() object) {
    return this.splitBillService.getGroupOverallValues(object.id)
  }

  @Get("person-wise/:id")
  @UseGuards(AuthGuard)
  getPersonWiseBills(@Param() object) {
    return this.splitBillService.getPersonWiseBillDetails(object.id)
  }

  @Get()
  @UseGuards(AuthGuard)
  billGroups(@Headers() headers, @Query() params) {
    return this.splitBillService.getGroupData(headers.user, params)
  }

  @Delete("bill/:id")
  @UseGuards(AuthGuard)
  deleteBill(@Param() object) {
    return this.splitBillService.deleteBill(object.id)
  }

  @Delete("person")
  @UseGuards(AuthGuard)
  deletePerson(@Query() params) {
    return this.splitBillService.deletePerson(params)
  }

  @Delete("/:id")
  @UseGuards(AuthGuard)
  deleteGroup(@Param() object) {
    return this.splitBillService.deleteGroup(object.id)
  }
}
