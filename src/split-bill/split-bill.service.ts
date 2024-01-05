import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SPB_GROUP_TABLE, SpbGroupModel } from './schemas/spb-group.schema';
import { Model } from 'mongoose';
import * as moment from "moment-timezone"
import { SPB_BILL_TABLE, SpbBillModel } from './schemas/spb-bills.schema';


@Injectable()
export class SplitBillService {

  constructor(
    @InjectModel(SPB_GROUP_TABLE)
    private spbGroupModel: Model<SpbGroupModel>,

    @InjectModel(SPB_BILL_TABLE)
    private spbBillModel: Model<SpbBillModel>
  ) { }

  /**
   * The function inserts a new group into the database and returns a success message or throws an
   * error if the creation fails.
   * @param {any} body - The `body` parameter is an object that contains the data for creating a new
   * group. It should have the necessary properties and values required by the `spbGroupModel.create`
   * method to successfully create a new group.
   * @returns an object with two properties: "data" and "message". The "data" property contains the
   * result of creating a new group using the "spbGroupModel.create" method, and the "message" property
   * is a string indicating that the group was successfully created.
   */
  async insertNewGroup(body: any) {
    try {
      let data = await this.spbGroupModel.create(body)
      return {
        data,
        message: "Group Created",
      }
    } catch (error) {
      let err_message = error.message ?? "Creation Failed"
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The function `getGroupData` retrieves aggregated data for a specific time range from a MongoDB
   * collection and performs some calculations on the retrieved data.
   * @param {any} params - The `params` object contains the following properties:
   * @returns The function `getGroupData` returns an object with two properties: `data` and `message`.
   * The `data` property contains the result of the aggregation query, which is an array of group data.
   * The `message` property is a string indicating the status of the operation, in this case, "Fetched
   * Month Data".
   */
  async getGroupData(params: any) {
    try {
      let data = await this.spbGroupModel.aggregate([
        {
          $match: {
            created_at: { $gt: moment.utc(params.start_time).toDate(), $lte: moment.utc(params.end_time).toDate() }
          },
        },
        {
          $addFields: {
            "document_id": {
              "$toString": "$_id"
            }
          }
        },
        {
          $lookup: {
            from: SPB_BILL_TABLE,
            localField: "document_id",
            foreignField: "group_id",
            as: "group_bills"
          }
        },
        {
          $addFields: {
            actual: { $sum: "$group_bills.value" }
          }
        },
        { $unset: ["document_id", "group_bills"] }
      ])
      return {
        data,
        message: "Fetched Month Data"
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Failed", error.status ?? 500)
    }
  }

  /**
   * The function deletes a group and all associated bills from a database.
   * @param {string} group_id - The `group_id` parameter is a string that represents the unique
   * identifier of a group. It is used to identify the group that needs to be deleted.
   * @returns an object with a "message" property set to "Bill Deleted".
   */
  async deleteGroup(group_id: string) {
    try {
      await this.spbBillModel.deleteMany({ group_id });
      await this.spbGroupModel.deleteOne({ _id: group_id })
      return {
        message: "Bill Deleted",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Deletion Failed", error.status ?? 500)
    }
  }

  async addBill(body: any) {
    try {
      await this.spbBillModel.insertMany(body)
      return {
        message: "Bill Created",
      }
    } catch (error) {
      let err_message = error.message ?? "Creation Failed"
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  async getGroupOverallValues(group_id: string) {
    try {
      const bill_sum = this.spbBillModel.aggregate([
        {
          $match: {
            group_id
          }
        },
        {
          $addFields: {
            total: { $sum: "$group_bills.value" }
          }
        },
      ])
      return {
        message: "fetched group overall data",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Failed to fetch", error.status ?? 500)
    }
  }

}
