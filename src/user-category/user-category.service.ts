import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_CATEGORY_TABLE, UserCategoryModel } from './schemas/user-category.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserCategoryService {

  constructor(
    @InjectModel(USER_CATEGORY_TABLE) private userCategory: Model<UserCategoryModel>
  ) { }

  /**
   * The function inserts user categories into a database and returns a success message.
   * @param {any} body - The `body` parameter is an object that contains the data to be inserted into
   * the user categories. It should have a property called `data` which is an array of objects
   * representing the user categories to be created. Each object in the `data` array should have the
   * necessary properties to define a user
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "Categories Created" and the "status" property is set to the value of the "HttpStatus.CREATED"
   * constant.
   */
  async insertUserCategories(body: any) {
    try {
      await this.userCategory.create(body)
      return {
        message: "Categories Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function `updateUserCatagories` updates a user category in a database using the provided body
   * and returns a success message.
   * @param {any} body - The parameter `body` is an object that contains the following properties:
   * @returns an object with two properties: "status" and "message". The "status" property is set to
   * HttpStatus.OK, indicating a successful operation, and the "message" property is set to "Category
   * Updated".
   */
  async updateUserCatagories(body: any) {
    try {
      await this.userCategory.updateOne({ _id: body.id }, {
        ...body.updated_values
      })
      return {
        status: HttpStatus.OK,
        message: "Category Updated"
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function getAllUserCategories retrieves all user categories and returns them along with a
   * status code.
   * @returns an object with two properties: "data" and "status". The "data" property contains the
   * result of executing the "find" method on the "userCategory" object, wrapped in an "await"
   * statement. The "status" property is set to "HttpStatus.OK".
   */
  async getAllUserCategories() {
    try {
      return {
        data: await this.userCategory.find().exec(),
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
