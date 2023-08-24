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
   * It takes in a body object, hashes the password, and then creates a new user
   * @param body - The request body
   * @returns {
   *     message: "User Created",
   *     status: HttpStatus.CREATED
   *   }
   */
  async signUpUser(body) {
    try {
      const saltOrRounds = 10;
      body["password"] = await bcrypt.hash(body["password"], saltOrRounds);
      let user_data = await this.userModel.create(body);
      try {
        let mail_body = {
          to: [
            body.email,
          ],
          title: "verification",
          subject: "Confirm Your Account",
          template: "test_temp",
          "context": {
            "name": body.name,
            "verifyLink": "https://tailwindcss.com/docs/customizing-colors",
            "attachments": []
          }
        }
        await this.sendMail(mail_body)
      } catch (error) {
        await this.userModel.deleteOne({ _id: user_data._id });
        throw new HttpException(error.message, error.status ?? 500)
      }
      // TODO implement the mail verification
      // let categories = await this.categoryModel.find().exec();
      // categories = JSON.parse(JSON.stringify(categories))
      // let user_category_to_insert = categories.map(category => {
      //   try {
      //     delete category._id
      //   } catch { }
      //   try {
      //     delete category["created_at"]
      //   } catch { }
      //   try {
      //     delete category["updated_at"]
      //   } catch { }
      //   return Object.assign({ user_id: user_data._id }, category)
      // })
      // try {
      //   await this.userCategoryModel.insertMany(user_category_to_insert)
      // } catch (error) {
      //   await this.userModel.deleteOne({ _id: user_data._id });
      //   throw new HttpException(error.message, error.status ?? 500)
      // }
      return {
        user_id: user_data._id,
        message: "User Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

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
