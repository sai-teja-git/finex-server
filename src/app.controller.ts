import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  defaultReq() {
    return { message: "Hello There", status: 200 }
  }

  @Post("send-mail")
  sendMail(@Body() body) {
    return this.appService.sendMail(body);
  }
}
