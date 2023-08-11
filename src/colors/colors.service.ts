import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { COLORS_TABLE } from './colors.schema';
import { Model } from 'mongoose';
import { Color } from './colors.interface';

@Injectable()
export class ColorsService {

  constructor(
    @InjectModel(COLORS_TABLE) private colors: Model<Color>
  ) { }

  /**
   * The function `insertColors` inserts multiple color data into a collection and returns a success
   * message.
   * @param {any} body - The `body` parameter is an object that contains the data to be inserted into
   * the `colors` collection. It should have a property called `data` which is an array of objects
   * representing the colors to be inserted. Each object in the `data` array should have the necessary
   * properties to define a
   * @returns an object with a "message" property set to "Colors Created" and a "status" property set
   * to HttpStatus.CREATED.
   */
  async insertColors(body: any) {
    try {
      await this.colors.insertMany(body.data)
      return {
        message: "Colors Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function getAllColors retrieves all colors and returns them along with a status code.
   * @returns an object with two properties: "data" and "status". The "data" property is the result of
   * executing the "find" method on the "colors" object, and the "status" property is the value of the
   * "HttpStatus.OK" constant.
   */
  async getAllColors() {
    try {
      return {
        data: this.colors.find().exec(),
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
