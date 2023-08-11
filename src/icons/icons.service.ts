import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ICONS_TABLE } from './icons.schema';
import { Model } from 'mongoose';
import { Icon } from './icons.interface';

@Injectable()
export class IconsService {

  constructor(
    @InjectModel(ICONS_TABLE) private iconModel: Model<Icon>
  ) { }

  /**
   * The function `insertIconTypes` inserts multiple icon types into the database and returns a success
   * message.
   * 
   * ### Eg body
   * ```ts
   * let body = {
   *     "data": [
   *         {
   *             "type": "transport",
   *             "alias": "Transport",
   *             "icons": [
   *                 {
   *                     "key": "car",
   *                     "name": "Car",
   *                     "icon": "fa fa-car"
   *                 }
   *             ]
   *         }
   *     ]
   * }
   * 
   * let response = {
   *     "message": "Icon types created Created",
   *     "status": 201
   * }
   * ```
   * 
   * @param {any} body - The `body` parameter is an object that contains the data to be inserted into
   * the database. It should have a property called `data` which is an array of objects representing
   * the icon types to be created.
   * @returns an object with two properties: "message" and "status". The "message" property is set to
   * "Icon types created Created" and the "status" property is set to the value of the
   * "HttpStatus.CREATED" constant.
   */
  async insertIconTypes(body: any) {
    try {
      await this.iconModel.insertMany(body.data)
      return {
        message: "Icon types created Created",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function `insertTypeIcons` inserts icons into a specific type in a database collection.
   * @param {string} type_id - The `type_id` parameter is a string that represents the ID of the type
   * for which the icons are being inserted.
   * @param {any} body - The `body` parameter is an object that contains the icons to be inserted.
   * @returns an object with two properties: "message" and "status". The value of "message" is "Icons
   * Inserted" and the value of "status" is "HttpStatus.CREATED".
   */
  async insertTypeIcons(type_id: string, body: any) {
    try {
      await this.iconModel.updateOne(
        { _id: type_id },
        { $push: { icons: body } },
      );
      return {
        message: "Icons Inserted",
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function `getAllIcons` retrieves all icons data or icons data with a specific ID and returns
   * it along with a status and message.
   * @param {string} type_id - The `type_id` parameter is a string that represents the ID of the icon
   * type. It is used to filter the icons based on their type. If the `type_id` is set to "all", it
   * means that all icons should be fetched regardless of their type. Otherwise, if a specific
   * @returns an object with the following properties:
   * - data: the result of the iconModel.find() operation
   * - status: HttpStatus.OK
   * - message: a string indicating whether all icons data was fetched or icons data with a specific id
   * was fetched.
   */
  async getAllIcons(type_id: string) {
    try {
      let data = await this.iconModel.find({ ...(type_id !== 'all' && { "_id": type_id }) })
      return {
        data,
        status: HttpStatus.OK,
        message: (type_id === 'all' ? "fetched All icons Data" : "Fetched Icons Data With Given Id")
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function updates the icon type in the database and returns a success message.
   * @param {any} body - The `body` parameter is an object that contains the following properties:
   * @returns an object with two properties: "status" and "message". The "status" property is set to
   * HttpStatus.OK, which is likely an HTTP status code indicating a successful request. The "message"
   * property is set to the string "Updated".
   */
  async updateIconType(body: any) {
    try {
      await this.iconModel.updateOne({ _id: body.id }, {
        ...body.updated
      })
      return {
        status: HttpStatus.OK,
        message: "Updated"
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

  /**
   * The function `updateIconData` updates a specific icon in a database collection based on the
   * provided `body` object.
   * @param {any} body - The `body` parameter is an object that contains the following properties:
   * @returns an object with two properties: "status" and "message". The "status" property is set to
   * HttpStatus.OK, and the "message" property is set to "Updated".
   */
  async updateIconData(body: any) {
    try {
      let update_object = {}
      for (let key in body.updated) {
        update_object["icons.$." + key] = body.updated[key]
      }
      await this.iconModel.updateOne({
        _id: body.type_id, "icons._id": body.icon_id
      }, {
        $set: update_object
      })
      return {
        status: HttpStatus.OK,
        message: "Updated"
      }
    } catch (error) {
      throw new HttpException(error.message, error.status ?? 500)
    }
  }

}
