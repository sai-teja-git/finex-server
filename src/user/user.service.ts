import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_TABLE, UserModel } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { CATEGORY_TABLE, CategoryModel } from 'src/category/schemas/category.schema';
import { USER_CATEGORY_TABLE, UserCategoryModel } from 'src/user-category/schemas/user-category.schema';
import { MailService } from 'src/common/services/mail/mail.service';
import * as moment from "moment-timezone"
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { USER_CREDITS_TABLE, UserCreditsModel } from 'src/transactions/schemas/user-credits.schema';
import { USER_ESTIMATIONS_TABLE, UserEstimationsModel } from 'src/transactions/schemas/user-estimations.schema';
import { USER_DEBITS_TABLE, UserDebitsModel } from 'src/transactions/schemas/user-debits.schema';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(USER_TABLE)
    private readonly userModel: Model<UserModel>,

    @InjectModel(CATEGORY_TABLE)
    private readonly categoryModel: Model<CategoryModel>,

    @InjectModel(USER_CATEGORY_TABLE)
    private readonly userCategoryModel: Model<UserCategoryModel>,

    @InjectModel(USER_CREDITS_TABLE)
    private userCreditsModel: Model<UserCreditsModel>,

    @InjectModel(USER_DEBITS_TABLE)
    private userDebitsModel: Model<UserDebitsModel>,

    @InjectModel(USER_ESTIMATIONS_TABLE)
    private userEstimationModel: Model<UserEstimationsModel>,

    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) { }

  /**
   * The function `signUpUser` is an asynchronous function that creates a new user, hashes their
   * password, generates a verification token, sends a verification email, and returns a success
   * message with the user ID.
   * @param body - The `body` parameter is an object that contains the user data needed for signing up.
   * It typically includes properties such as `name`, `email`, and `password`.
   * @returns an object with the following properties:
   * - user_id: The ID of the created user.
   * - message: A message indicating that the user was created.
   * - status: The HTTP status code indicating that the user was created (HttpStatus.CREATED).
   */
  async signUpUser(body) {
    let user_data: any = null;
    try {
      const saltOrRounds = 10;
      body["password"] = await bcrypt.hash(body["password"], saltOrRounds);
      user_data = await this.userModel.create(body);
      const token = this.jwtService.sign({ user_id: user_data._id }, { expiresIn: "1d", secret: env.JWT_SECRET_KEY })
      const verification_link = `${env.UI_DOMAIN}/email-verification?code=${token}`;
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
      try {
        await this.userModel.deleteOne({ _id: user_data._id })
      } catch { }
      let err_message = "Failed To Create User"
      if (error.code == 11000) {
        err_message = "Oops! It seems like there's already a user with the same user name, try another"
      }
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The deleteUser function deletes a user and all related data from multiple collections in a
   * database.
   * @param {string} user_id - The `user_id` parameter is a string that represents the unique
   * identifier of the user to be deleted.
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "User Removed" and the "status" property is set to "HttpStatus.CREATED".
   */
  async deleteUser(user_id: string) {
    try {
      await Promise.all([
        this.userCategoryModel.deleteMany({ user_id }),
        this.userCreditsModel.deleteMany({ user_id }),
        this.userEstimationModel.deleteMany({ user_id }),
        this.userDebitsModel.deleteMany({ user_id }),
        this.userModel.deleteOne({ _id: user_id })
      ])
      return {
        message: "User Removed",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message ?? "delete failed", error.status ?? 500)
    }
  }

  /**
   * The `verifyUser` function is an asynchronous function that decodes and verifies a JWT token,
   * updates the user's verification status, inserts user categories, and returns a success message if
   * successful.
   * @param {any} req_data - The `req_data` parameter is an object that contains the following
   * properties:
   * @returns an object with two properties: "message" and "status". The "message" property contains
   * the string "User Verified", and the "status" property contains the value of the constant
   * "HttpStatus.CREATED".
   */
  async verifyUser(req_data: any) {
    try {
      let user_req_data: any = this.jwtService.decode(req_data.code)
      try {
        await this.jwtService.verifyAsync(
          req_data.code,
          {
            secret: env.JWT_SECRET_KEY
          }
        );
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new Error("Link Expired")
        } else {
          throw new Error("Invalid Link")
        }
      }
      let user_data = await this.userModel.findOne({
        _id: user_req_data.user_id
      })
      if (user_data.verified) {
        throw new Error("User Already Verified")
      }
      try {
        await this.userModel.updateOne({ _id: user_req_data.user_id }, {
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
        return Object.assign({ user_id: user_req_data.user_id }, category)
      })
      try {
        await this.userCategoryModel.insertMany(user_category_to_insert)
      } catch (error) {
        try {
          await this.userModel.updateOne({ _id: user_req_data.user_id }, {
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

  /**
   * The function `sendForgetPasswordLink` sends a forget password link to the user's email address if
   * the provided username and email match the database records.
   * @param {any} body - The `body` parameter is an object that contains the following properties:
   * @returns an object with two properties: "message" and "status". The "message" property contains
   * the string "Reset link sent" and the "status" property contains the value of the
   * HttpStatus.CREATED constant.
   */
  async sendForgetPasswordLink(body: any) {
    try {
      const user_data = await this.userModel.findOne({
        user_name: body.user_name
      })
      if (!user_data) {
        throw new HttpException("User Name not found", HttpStatus.FORBIDDEN)
      }
      if (user_data.email !== body.email) {
        throw new Error("Mail is not linked with this username")
      }
      const token = this.jwtService.sign({ user_id: user_data._id }, { expiresIn: "5m", secret: env.JWT_SECRET_KEY })
      const password_link = `${env.UI_DOMAIN}/reset-password?code=${token}`;
      let mail_body = {
        to: [
          body.email,
        ],
        title: "Reset password",
        subject: "Update your password",
        template: "forget_password",
        "context": {
          "name": user_data.name,
          "passowrd_link": password_link,
          "attachments": []
        }
      }
      await this.sendMail(mail_body)
      return {
        message: "Reset link sent",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      let err_message = error.message ? error.message : "Failed To send link"
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The function `resetUserPassword` is an asynchronous function that resets a user's password based
   * on a provided code, verifies the code, checks if the user is verified, hashes the new password,
   * updates the user's password in the database, and returns a success message.
   * @param {any} body - The `body` parameter is an object that contains the following properties:
   * @returns an object with two properties: "message" and "status". The "message" property contains
   * the string "User Password Updated" and the "status" property contains the value
   * HttpStatus.CREATED.
   */
  async resetUserPassword(body: any) {
    try {
      let user_req_data: any = this.jwtService.decode(body.code)
      try {
        await this.jwtService.verifyAsync(
          body.code,
          {
            secret: env.JWT_SECRET_KEY
          }
        );
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new Error("Link Expired")
        } else {
          throw new Error("Invalid Link")
        }
      }
      let user_data = await this.userModel.findOne({
        _id: user_req_data.user_id
      })
      if (!user_data.verified) {
        throw new Error("User Not Verified")
      }
      const saltOrRounds = 10;
      let new_password = await bcrypt.hash(body["password"], saltOrRounds);
      if (user_data.password === new_password) {
        throw new Error("New Password can't be old one, try another")
      }
      await this.userModel.updateOne({ _id: user_req_data.user_id }, {
        password: new_password
      })
      return {
        message: "User Password Updated",
        status: HttpStatus.CREATED,
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Invalid Link", error.status ?? 500)
    }
  }

}
