import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TIME_ZONE_TABLE, TimeZoneModel } from './schemas/time-zone.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from "moment-timezone"

@Injectable()
export class TimeZoneService {

  constructor(
    @InjectModel(TIME_ZONE_TABLE) private timeZoneModel: Model<TimeZoneModel>,
  ) { }

  /**
   * The function inserts time zone data into a database using the provided body data.
   * @param {any} body - The parameter `body` is of type `any` and represents the request body that
   * contains the data to be inserted into the time zone model.
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "Time Zone Created" and the "status" property is set to the value of the "HttpStatus.CREATED"
   * constant.
   */
  async insertTimeZoneData(body: any) {
    try {
      await this.timeZoneModel.insertMany(body.data)
      return {
        message: "Time Zone Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function retrieves all time zones from the database and returns them as a promise.
   * @returns The getAllTimeZones function is returning a promise that resolves to the result of
   * executing the find method on the timeZoneModel.
   */
  async getAllTimeZones() {
    try {
      return {
        data: await this.timeZoneModel.find().exec(),
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  async getDataBetweenTwoDates(body: any) {
    try {
      /**
       * ```ts
       * {
       *    start_time:"2023-07-01T00:00:00Z",
       *    end_time:"2023-07-01T10:00:00Z"
       * }
       * ```
       * need T and Z for the zone conversion, for filtering the mongodb
       */
      return this.timeZoneModel.find({ updated_at: { $gte: moment.utc(body.start_time).toDate(), $lte: moment.utc(body.end_time).toDate() } })
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
