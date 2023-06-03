import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';
import { USER_TABLE } from './user.schema';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(USER_TABLE) private userModel: Model<User>,
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
      await this.userModel.insertMany(body)
      return {
        message: "User Created",
        status: HttpStatus.CREATED
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
