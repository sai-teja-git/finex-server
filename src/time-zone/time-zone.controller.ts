import { Body, Controller, Get, Post } from '@nestjs/common';
import { TimeZoneService } from './time-zone.service';

@Controller('time-zones')
export class TimeZoneController {
  constructor(private readonly timeZoneService: TimeZoneService) { }

  @Post()
  insertTimeZoneData(@Body() body) {
    return this.timeZoneService.insertTimeZoneData(body)
  }

  @Get()
  getTimeZones() {
    return this.timeZoneService.getAllTimeZones()
  }

  @Post("data-between")
  getDataBetween(@Body() body) {
    return this.timeZoneService.getDataBetweenTwoDates(body)
  }

}
