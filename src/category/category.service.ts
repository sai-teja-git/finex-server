import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CATEGORY_TABLE, CategoryModel } from './schemas/category.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {

  constructor(
    @InjectModel(CATEGORY_TABLE) private category: Model<CategoryModel>
  ) { }

  /**
   * The function inserts multiple categories into a database and returns a success message.
   * @param {any} body - The `body` parameter is an object that contains the data to be inserted into
   * the categories collection. It should have a property called `data` which is an array of category
   * objects. Each category object should have the necessary properties to create a category in the
   * database.
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "Categories Created" and the "status" property is set to the value of the "HttpStatus.CREATED"
   * constant.
   */
  async insertCategories(data: any) {
    try {
      await this.category.insertMany(data)
      return {
        message: "Categories Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function getAllCategories retrieves all categories and returns them along with a status code.
   * @returns an object with two properties: "data" and "status". The "data" property contains the
   * result of executing the "find" method on the "category" object, using the "exec" method. The
   * "status" property is set to the value of the "HttpStatus.OK" constant.
   */
  async getAllCategories() {
    try {
      return {
        data: await this.category.find().exec(),
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
