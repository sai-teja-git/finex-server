import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserCategoryService } from './user-category.service';

@Controller('user-category')
export class UserCategoryController {
  constructor(private readonly userCategoryService: UserCategoryService) { }

  @Post()
  insertColors(@Body() body) {
    return this.userCategoryService.insertUserCategories(body)
  }

  @Get()
  getALLColors() {
    return this.userCategoryService.getAllUserCategories()
  }

  @Patch()
  updateUserCategories(@Body() body) {
    return this.userCategoryService.updateUserCatagories(body)
  }
}
