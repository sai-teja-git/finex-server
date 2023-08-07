import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IconsService } from './icons.service';
import { CreateIconDto } from './dto/create-icon.dto';

@Controller('icons')
export class IconsController {
  constructor(private readonly iconsService: IconsService) { }

  @Post("types")
  insertTypes(@Body() body) {
    return this.iconsService.insertIconTypes(body)
  }

  @Post("icon/:id")
  insertIcons(@Param() object, @Body() body) {
    return this.iconsService.insertTypeIcons(object.id, body)
  }

  @Get("/:type_id")
  getAllIcons(@Param() object) {
    return this.iconsService.getAllIcons(object.type_id)
  }

}
