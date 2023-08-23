import { Module } from '@nestjs/common';
import { UserCategoryService } from './user-category.service';
import { UserCategoryController } from './user-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_CATEGORY_TABLE, UserCategorySchema } from './schemas/user-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: USER_CATEGORY_TABLE,
        schema: UserCategorySchema
      }
    ])
  ],
  controllers: [UserCategoryController],
  providers: [UserCategoryService]
})
export class UserCategoryModule { }
