import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TimeZoneService } from './time-zone.service';
import { AuthGuard } from 'src/user/guards/auth.guard';

@Controller('time-zones')
export class TimeZoneController {
  constructor(private readonly timeZoneService: TimeZoneService) { }

  @Post()
  @UseGuards(AuthGuard)
  insertTimeZoneData(@Body() body) {
    return this.timeZoneService.insertTimeZoneData(body)
  }

  @Get()
  @UseGuards(AuthGuard)
  getTimeZones() {
    return this.timeZoneService.getAllTimeZones()
  }

  @Post("data-between")
  @UseGuards(AuthGuard)
  getDataBetween(@Body() body) {
    return this.timeZoneService.getDataBetweenTwoDates(body)
  }

}
