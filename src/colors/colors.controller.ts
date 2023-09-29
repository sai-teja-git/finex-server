import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColorsService } from './colors.service';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) { }

  @Post()
  insertColors(@Body() body) {
    return this.colorsService.insertColors(body)
  }

  @Get()
  getALLColors() {
    return this.colorsService.getAllColors()
  }

}
