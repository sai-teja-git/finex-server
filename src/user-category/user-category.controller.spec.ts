import { Test, TestingModule } from '@nestjs/testing';
import { UserCategoryController } from './user-category.controller';
import { UserCategoryService } from './user-category.service';

describe('UserCategoryController', () => {
  let controller: UserCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCategoryController],
      providers: [UserCategoryService],
    }).compile();

    controller = module.get<UserCategoryController>(UserCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
