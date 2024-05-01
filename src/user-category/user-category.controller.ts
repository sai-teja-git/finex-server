import { Body, Controller, Get, Param, Patch, Post, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { UserCategoryService } from './user-category.service';

@Controller('user-category')
export class UserCategoryController {
  constructor(private readonly userCategoryService: UserCategoryService) { }

  @Post()
  insertColors(@Body() body) {
    return this.userCategoryService.insertUserCategories(body)
  }

  @Patch()
  updateUserCategories(@Headers() headers, @Body() body) {
    return this.userCategoryService.updateUserCatagories(headers.user, body)
  }

  @Get()
  @UseGuards(AuthGuard)
  getUserCategories(@Headers() headers) {
    return this.userCategoryService.getUserCategories(headers.user)
  }
}
