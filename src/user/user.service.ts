import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { env } from 'process';
import { CATEGORY_TABLE, CategoryModel } from 'src/category/schemas/category.schema';
import { CURRENCY_TABLE, CurrencyModel } from 'src/currency/schemas/currency.schema';
import { TIME_ZONE_TABLE, TimeZoneModel } from 'src/time-zone/schemas/time-zone.schema';
import { USER_CREDITS_TABLE, UserCreditsModel } from 'src/transactions/schemas/user-credits.schema';
import { USER_DEBITS_TABLE, UserDebitsModel } from 'src/transactions/schemas/user-debits.schema';
import { USER_ESTIMATIONS_TABLE, UserEstimationsModel } from 'src/transactions/schemas/user-estimations.schema';
import { USER_CATEGORY_TABLE, UserCategoryModel } from 'src/user-category/schemas/user-category.schema';
import { URLSearchParams } from 'url';
import { USER_TABLE, UserModel } from './schemas/user.schema';
import { NotificationService } from 'src/common/services/notification.service';

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

    @InjectModel(TIME_ZONE_TABLE)
    private timeZoneModel: Model<TimeZoneModel>,

    @InjectModel(CURRENCY_TABLE)
    private currencyModel: Model<CurrencyModel>,

    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) { }

  /**
   * The createUser function creates a new user, assigns default time zone and currency, sends a
   * verification email, and handles errors appropriately.
   * @param body - The `createUser` function you provided is responsible for creating a new user in
   * your system. It performs the following steps:
   * @returns {
   *   user_id: user_data._id,
   *   message: "User Created",
   *   status: HttpStatus.CREATED
   * }
   */
  async createUser(body) {
    let user_data: any = null;
    try {
      const [timeZoneData, currencyData] = await Promise.all([
        this.getTimeZone(body.zone_offset),
        this.currencyModel.findOne({ name: "Indian Rupee" })
      ])
      body = {
        ...body,
        time_zone_id: timeZoneData._id,
        time_zone: timeZoneData.zone,
        time_zone_gmt_time: timeZoneData.gmt_time,
        time_zone_gmt_minutes: timeZoneData.gmt_minutes,
        currency_id: currencyData._id,
        currency_name: currencyData.name,
        currency_name_plural: currencyData.name_plural,
        currency_decimal_digits: currencyData.decimal_digits,
        currency_code: currencyData.code,
        currency_icon_class: currencyData.icon_class,
        currency_html_code: currencyData.html_code,
      }
      user_data = await this.userModel.create(body);
      const token = this.jwtService.sign({ user_id: user_data._id }, { expiresIn: "1d", secret: env.JWT_SECRET_KEY })

      const params = new URLSearchParams({
        code: token,
        verification: "email"
      }).toString()

      const verification_link = `${env.UI_DOMAIN}/email-verification?${params}`;
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
            "verify_link": encodeURI(verification_link),
            "attachments": []
          }
        }

        await this.sendInvitation(mail_body)
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
   * The function updates the details of a user with the given ID and returns a success message.
   * @param id - The id parameter is the unique identifier of the user whose details need to be
   * updated. It is used to find the user in the database.
   * @param data - The `data` parameter is an object that contains the updated user details. It could
   * include properties such as name, email, age, address, etc.
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "User Details Updated" and the "status" property is set to the value of the "HttpStatus.OK"
   * constant.
   */
  async updateUser(headers, data) {
    try {
      await this.userModel.updateOne({ _id: headers.user }, data)
      return {
        message: "User Details Updated",
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
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
   * This TypeScript function returns the default time zone data based on a given GMT offset in
   * minutes.
   * @param {number} zone_offset - The `zone_offset` parameter in the `getTimeZone` function
   * represents the offset in minutes from GMT (Greenwich Mean Time). This function is designed to
   * retrieve timezone data based on the provided offset. If a timezone with the specified offset is
   * found in the database, it will be returned. Otherwise
   * @returns The `getTimeZone` function returns a Promise that resolves with either the time
   * zone data corresponding to the provided `zone_offset` if found in the database, or the default
   * time zone data if no matching record is found.
   */
  private async getTimeZone(zone_offset: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const timeZones = await this.timeZoneModel.find({ gmt_minutes: zone_offset })
        if (timeZones.length) {
          resolve(timeZones[0])
        } else {
          const defaultData = await this.timeZoneModel.findOne()
          resolve(defaultData)
        }
      } catch (e) {
        reject(e)
      }
    })
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
  private async sendInvitation(body: Record<string, any>) {
    try {
      let mail_data = await this.notificationService.sendTemplatedEmail(body)
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
}
