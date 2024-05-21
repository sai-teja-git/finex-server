import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_CATEGORY_TABLE, UserCategoryModel } from './schemas/user-category.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserCategoryService {

  constructor(
    @InjectModel(USER_CATEGORY_TABLE) private userCategoryModel: Model<UserCategoryModel>
  ) { }

  /**
   * The function `insertUserCategories` inserts user categories into a database and handles duplicate
   * category name errors.
   * @param {string} user_id - The `user_id` parameter is a string that represents the unique
   * identifier of a user for whom the categories are being created.
   * @param {any} body - The `body` parameter in the `insertUserCategories` function represents the
   * data that contains the categories to be inserted for a specific user. It could include information
   * such as the category name, description, or any other relevant details needed for creating a
   * category for the user.
   * @returns The function `insertUserCategories` is returning an object with a message "Categories
   * Created" and a status of HttpStatus.CREATED if the user categories are successfully created. If
   * there is an error during the creation process, it will throw an HttpException with an error
   * message based on the specific error encountered. If the error is due to a duplicate key (error
   * code 11000), the error message will indicate
   */
  async insertUserCategories(user_id: string, body: any) {
    try {
      await this.userCategoryModel.create({ ...body, user_id })
      return {
        message: "Categories Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      let err_message = error.message ?? "Creation Failed"
      if (error.code == 11000) {
        err_message = "Oops! It seems like there's already a category with the same name, try another"
      }
      throw new HttpException(err_message, error.status ?? 500)
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
  async updateUserCatagories(id, data: any) {
    try {
      await this.userCategoryModel.updateOne({ _id: id }, data)
      return {
        status: HttpStatus.OK,
        message: "Category Updated"
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function `getUserCategories` retrieves spend and income categories for a specific user or all
   * users.
   * @param user_id - The `user_id` parameter is used to specify the ID of the user for which the
   * categories should be fetched. If the value of `user_id` is set to `'all'`, it indicates that
   * categories for all users should be fetched. Otherwise, it will fetch categories specific to the
   * user with
   * @returns an object with the following properties:
   * - spend_categories: an array of user categories with type "spend"
   * - income_categories: an array of user categories with type "income"
   * - status: the HTTP status code (HttpStatus.OK)
   * - message: a message indicating whether all user categories or specific user categories were
   * fetched.
   */
  async getUserCategories(user_id) {
    try {
      let data = await this.userCategoryModel.find({ ...(user_id !== 'all' && { "user_id": user_id }) });
      let user_categories = JSON.parse(JSON.stringify(data))
      let spend_categories = user_categories.filter(e => e["type"] === "spend")
      let income_categories = user_categories.filter(e => e["type"] === "income");
      return {
        spend_categories,
        income_categories,
        status: HttpStatus.OK,
        message: (user_id === 'all' ? "fetched All Users Categories" : "Fetched User Categories")
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
