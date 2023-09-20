import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserCategoryService } from './user-category.service';

@Controller('user-category')
export class UserCategoryController {
  constructor(private readonly userCategoryService: UserCategoryService) { }

  @Post()
  insertColors(@Body() body) {
    return this.userCategoryService.insertUserCategories(body)
  }

  @Patch("/:id")
  updateUserCategories(@Param() object, @Body() body) {
    return this.userCategoryService.updateUserCatagories(object.id, body)
  }

  @Get("/:user_id")
  getUserCategories(@Param() object) {
    return this.userCategoryService.getUserCategories(object.user_id)
  }
}
