import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { User } from './user.interface';
import { USER_TABLE, UserModel } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { CATEGORY_TABLE, CategoryModel } from 'src/category/schemas/category.schema';
import { USER_CATEGORY_TABLE, UserCategoryModel } from 'src/user-category/schemas/user-category.schema';
import { MailService } from 'src/common/services/mail/mail.service';
import * as moment from "moment-timezone"

@Injectable()
export class UserService {

  constructor(
    @InjectModel(USER_TABLE) private readonly userModel: Model<UserModel>,
    @InjectModel(CATEGORY_TABLE) private readonly categoryModel: Model<CategoryModel>,
    @InjectModel(USER_CATEGORY_TABLE) private readonly userCategoryModel: Model<UserCategoryModel>,
    private readonly mailService: MailService,
    private authService: AuthService
  ) { }

  /**
   * The function `signUpUser` is an asynchronous function that creates a new user, hashes their
   * password, generates a verification link, sends a verification email, and returns a success
   * message.
   * @param body - The `body` parameter is an object that contains the user data needed for signing up.
   * It typically includes properties such as `name`, `email`, and `password`.
   * @returns an object with the following properties:
   * - user_id: The ID of the created user.
   * - message: A message indicating that the user has been created.
   * - status: The HTTP status code for the response, which is HttpStatus.CREATED.
   */
  async signUpUser(body, req: any) {
    try {
      const saltOrRounds = 10;
      body["password"] = await bcrypt.hash(body["password"], saltOrRounds);
      let user_data = await this.userModel.create(body);
      let data_for_verification = {
        user_id: user_data._id,
        generated_at: new Date(),
        expire_time: new Date(new Date().setDate(new Date().getDate() + 1))
      }
      let verification_link = req.headers.origin + "/email-verification?data=" + btoa(JSON.stringify(data_for_verification))
      try {
        let mail_body = {
          to: [
            body.email,
          ],
          title: "verification",
          subject: "Confirm Your Account",
          template: "email_verification",
          "context": {
            "name": body.name,
            "verify_link": verification_link,
            "attachments": []
          }
        }
        await this.sendMail(mail_body)
      } catch (error) {
        await this.userModel.deleteOne({ _id: user_data._id });
        throw new HttpException(error.message, error.status ?? 500)
      }
      return {
        user_id: user_data._id,
        message: "User Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      let err_message = "Failed To Create User"
      if (error.code == 11000) {
        err_message = "Oops! It seems like there's already a user with the same user name, try another"
      }
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The `verifyUser` function is an asynchronous function that verifies a user by updating their
   * verification status, inserting user categories, and returning a success message.
   * @param {any} data - The `data` parameter is an object that contains the following properties:
   * @returns an object with two properties: "message" and "status". The "message" property contains
   * the string "User Verified" and the "status" property contains the value of the constant
   * "HttpStatus.CREATED".
   */
  async verifyUser(data: any) {
    try {
      let expire_diff = new Date(data.expire_time).getTime() - new Date().getTime()
      if (expire_diff <= 0) {
        throw new Error("Link Expired")
      }
      let user_data = await this.userModel.findOne({
        _id: data.user_id
      })
      if (user_data.verified) {
        throw new Error("User Already Verified")
      }
      try {
        await this.userModel.updateOne({ _id: data.user_id }, {
          verified: true
        })
      } catch {
        throw new Error("Invalid Link")
      }
      let categories = await this.categoryModel.find().exec();
      categories = JSON.parse(JSON.stringify(categories))
      let user_category_to_insert = categories.map(category => {
        try {
          delete category._id
        } catch { }
        try {
          delete category["created_at"]
        } catch { }
        try {
          delete category["updated_at"]
        } catch { }
        return Object.assign({ user_id: data.user_id }, category)
      })
      try {
        await this.userCategoryModel.insertMany(user_category_to_insert)
      } catch (error) {
        try {
          await this.userModel.updateOne({ _id: data.user_id }, {
            verified: false
          })
        } catch {
          throw new Error("Invalid Link")
        }
        throw new Error(error.message ?? "Invalid Link")
      }
      return {
        message: "User Verified",
        status: HttpStatus.CREATED,
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Invalid Link", error.status ?? 500)
    }
  }

  /**
   * The function `sendMail` sends a templated email using the `mailService` and returns a response
   * object with the envelope and message ID.
   * @param body - The `body` parameter is the data that contains the necessary information for sending
   * the email. It could include details such as the recipient's email address, the subject of the
   * email, the content of the email, and any other relevant information needed for sending the email.
   * @returns an object with the following properties:
   * - message: "Mail Sent"
   * - status: HttpStatus.CREATED
   * - data: an object with the properties envelope and messageId, which are obtained from the
   * mail_data object returned by the mailService.sendTemplatedEmail() function.
   */
  async sendMail(body) {
    try {
      let mail_data = await this.mailService.sendTemplatedEmail(body)
      return {
        message: "Mail Sent",
        status: HttpStatus.CREATED,
        data: {
          envelope: mail_data.envelope,
          messageId: mail_data.messageId
        }
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * It returns a promise of an array of users
   * @returns An array of users
   */
  async getAllUsers() {
    try {
      return {
        data: await this.userModel.find().exec(),
        message: "User Details Fetched",
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function updates the details of a user with the given ID and returns a success message.
   * @param id - The id parameter is the unique identifier of the user whose details need to be
   * updated. It is used to find the user in the database.
   * @param data - The `data` parameter is an object that contains the updated user details. It could
   * include properties such as name, email, age, address, etc.
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "User Details Updated" and the "status" property is set to the value of the "HttpStatus.OK"
   * constant.
   */
  async updateUserDetails(id, data) {
    try {
      await this.userModel.updateOne({ _id: id }, data)
      return {
        message: "User Details Updated",
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function updates a user's password in a database, checking if the old password provided
   * matches the current password before updating it.
   * @param id - The `id` parameter is the unique identifier of the user whose password needs to be
   * updated. It is used to find the user in the database.
   * @param data - The `data` parameter is an object that contains the user's old password and the new
   * password they want to update to. It should have the following structure:
   * @returns an object with two properties: "message" and "status". The "message" property contains
   * the string "User Details Updated" and the "status" property contains the value of the
   * HttpStatus.OK constant.
   */
  async updateUserPassword(id, data) {
    try {
      let user_data = await this.userModel.findOne({ _id: id }).exec();
      if (!(await bcrypt.compare(data["old_password"], user_data["password"]))) {
        throw new HttpException("Invalid Old Password", HttpStatus.FORBIDDEN)
      }
      const saltOrRounds = 10;
      let new_password = await bcrypt.hash(data["new_password"], saltOrRounds);
      await this.userModel.updateOne({ _id: id }, {
        password: new_password
      })
      return {
        message: "User Details Updated",
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * It takes the user name and password from the request body, checks if the user exists in the
   * database, if it does, it checks if the password is correct, if it is, it updates the last login
   * time and returns a token and user data
   * @param body - The request body.
   * @returns {
   *     message: "Success",
   *     status: HttpStatus.OK,
   *     data: {
   *       token: await this.authService.generateToken(
   *         { username: body["user_name"] + user_data["_id"] },
   *         Number(process.env.USER_TOKEN_EXPIRY_IN_SEC
   */
  async login(body) {
    try {
      let user_data = await this.userModel.findOne({ user_name: body["user_name"] }).exec();
      if (!user_data) {
        throw new HttpException("Invalid Credentials", HttpStatus.FORBIDDEN)
      }
      if (!user_data.verified) {
        throw new Error("User Not Verified")
      }
      if (!(await bcrypt.compare(body["password"], user_data["password"]))) {
        throw new HttpException("Invalid Credentials", HttpStatus.FORBIDDEN)
      }

      let token = await this.authService.generateToken(
        { username: body["user_name"], id: user_data["_id"] },
        Number(process.env.USER_TOKEN_EXPIRY_IN_SEC)
      )
      await this.userModel.updateOne({ _id: user_data["_id"] }, { last_login: moment.utc() })
      return {
        message: "Success",
        status: HttpStatus.OK,
        data: {
          token,
          name: user_data["name"],
          email: user_data["email"],
          id: user_data["_id"],
          last_login: user_data["last_login"],
          currency_id: user_data["currency_id"],
          currency_icon: user_data["currency_icon_class"],
          currency_code: user_data["currency_html_code"],
          currency_name: user_data["currency_name"],
          currency_name_plural: user_data["currency_name_plural"],
          currency_decimal_digits: user_data["currency_decimal_digits"],
          time_zone: user_data["time_zone"],
          time_zone_id: user_data["time_zone_id"],
        }
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
