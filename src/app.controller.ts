import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  defaultReq() {
    return { message: "Hello There", status: 200 }
  }
}
