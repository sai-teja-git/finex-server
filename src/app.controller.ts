import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("send-mail")
  sendMail(@Body() body) {
    return this.appService.sendMail(body);
  }
}
