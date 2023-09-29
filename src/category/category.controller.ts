import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  insertCategories(@Body() body) {
    return this.categoryService.insertCategories(body)
  }

  @Get()
  getALLCategories() {
    return this.categoryService.getAllCategories()
  }

}
