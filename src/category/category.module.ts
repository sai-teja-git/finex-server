import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CATEGORY_TABLE, CategorySchema } from './schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CATEGORY_TABLE,
        schema: CategorySchema
      }
    ])
  ],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule { }
