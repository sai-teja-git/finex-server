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
  async signUpUser(body) {
    try {
      const saltOrRounds = 10;
      body["password"] = await bcrypt.hash(body["password"], saltOrRounds);
      let user_data = await this.userModel.create(body);
      let data_for_verification = {
        user_id: user_data._id,
        generated_at: new Date(),
        expire_time: new Date(new Date().setDate(new Date().getDate() + 1))
      }
      let verification_link = body.email_host + btoa(JSON.stringify(data_for_verification))
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
      throw new HttpException(error.message, error.status ?? 500)
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
  async getAllUsers(): Promise<User[]> {
    try {
      return this.userModel.find().exec();
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
        throw new HttpException("Invalid User Name", HttpStatus.UNAUTHORIZED)
      }
      if (!(await bcrypt.compare(body["password"], user_data["password"]))) {
        throw new HttpException("Invalid Password", HttpStatus.UNAUTHORIZED)
      }
      await this.userModel.updateOne({ id: user_data["_id"] }, { last_login: new Date() })
      return {
        message: "Success",
        status: HttpStatus.OK,
        data: {
          token: await this.authService.generateToken(
            { username: body["user_name"], id: user_data["_id"] },
            Number(process.env.USER_TOKEN_EXPIRY_IN_SEC)
          ),
          name: user_data["name"],
          email: user_data["email"],
          id: user_data["_id"],
          last_login: user_data["last_login"]
        }
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
