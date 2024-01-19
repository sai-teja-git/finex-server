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
   * The function `getGroupData` retrieves group data based on specified parameters and returns it
   * along with a success message.
   * @param {any} params - - start_time: The start time for filtering the data (in UTC format)
   * @returns an object with two properties: "data" and "message". The "data" property contains the
   * result of the aggregation query, while the "message" property is a string indicating the status of
   * the operation ("Fetched Month Data" in this case).
   */
  async getGroupData(params: any) {
    try {
      let data = await this.spbGroupModel.aggregate([
        {
          $match: {
            $and: [
              { user_id: params.user_id },
              { created_at: { $gt: moment.utc(params.start_time).toDate(), $lte: moment.utc(params.end_time).toDate() } }
            ]
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
   * The function updates a group with the given ID using the provided data.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * group that needs to be updated. It is used to find the specific group in the database.
   * @param {any} body - The `body` parameter is an object that contains the updated data for the
   * group. It can include any properties that need to be updated for the group.
   * @returns an object with a "message" property set to "Group Updated".
   */
  async updateGroup(id: string, body: any) {
    try {
      await this.spbGroupModel.updateOne({ _id: id }, body)
      return {
        message: "Group Updated",
      }
    } catch (error) {
      let err_message = error.message ?? "Update Failed"
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The function `addPersonToGroup` adds a person or multiple persons to a group identified by its ID.
   * @param {string} id - The `id` parameter is a string that represents the identifier of the group to
   * which the person will be added. It is used to find the group in the database.
   * @param {any} body - The `body` parameter is an object that contains the data of the person to be
   * added to the group. It can include properties such as name, age, address, etc.
   * @returns an object with two properties: "data" and "message". The "data" property contains the
   * updated document after adding the person to the group, and the "message" property is a string
   * indicating that the person has been added.
   */
  async addPersonToGroup(id: string, body: any) {
    try {
      const data = await this.spbGroupModel.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            persons: {
              $each: body
            }
          }
        },
        { returnDocument: "after" }
      )
      return {
        data,
        message: "Person Added",
      }
    } catch (error) {
      let err_message = error.message ?? "Update Failed"
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The function updates the details of a person in a group, including incrementing a "paid" field if
   * provided.
   * @param {any} body - The `body` parameter is an object that contains the following properties:
   * @returns an object with two properties: "data" and "message". The "data" property contains the
   * updated person details, and the "message" property contains the message "Person Details Updated".
   */
  async updatePersonDetails(body: any) {
    try {
      let set_body = {};
      let inc_body = {};
      for (let key in body.data) {
        if (key === "paid") {
          inc_body["persons.$." + key] = body.data[key]
        } else {
          set_body["persons.$." + key] = body.data[key]
        }
      }
      const data = await this.spbGroupModel.findOneAndUpdate(
        { _id: body.group_id, "persons._id": body.person_id },
        {
          ...(Object.keys(set_body).length && {
            $set: set_body
          }),
          ...(Object.keys(inc_body).length && {
            $inc: inc_body
          })
        },
        { returnDocument: "after" }
      )
      return {
        data,
        message: "Person Details Updated",
      }
    } catch (error) {
      let err_message = error.message ?? "Update Failed"
      throw new HttpException(err_message, error.status ?? 500)
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
        message: "Bill Group Deleted",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Deletion Failed", error.status ?? 500)
    }
  }

  /**
   * The function `addBill` creates a new bill by inserting the provided data into the database and
   * returns a success message.
   * @param {any} body - The `body` parameter is an object that contains the data for creating a bill.
   * It is passed to the `addBill` function as an argument.
   * @returns an object with a "message" property set to "Bill Created".
   */
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

  /**
   * The function `getGroupOverallValues` retrieves overall data and bill data for a specific group.
   * @param {string} group_id - The `group_id` parameter is a string that represents the unique
   * identifier of a group. It is used to query and retrieve data related to that specific group.
   * @returns an object with two properties: "data" and "message". The "data" property contains the
   * estimation value from the overall_data array and the total and data properties from the bill_data
   * array. The "message" property contains the string "fetched group overall data".
   */
  async getGroupOverallValues(group_id: string) {
    try {
      const [overall_data, bill_data] = await Promise.all([
        this.spbGroupModel.find({ _id: group_id }, { estimation: 1 }),
        this.spbBillModel.aggregate([
          {
            $match: {
              group_id
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$value" },
              data: {
                $push: "$$ROOT"
              }
            }
          },
          {
            $unset: ["_id"]
          }
        ])
      ])
      return {
        data: {
          estimation: overall_data[0]?.estimation,
          ...bill_data[0]
        },
        message: "fetched group overall data",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Failed to fetch", error.status ?? 500)
    }
  }

  /**
   * The function updates a bill with the given ID using the provided data.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * bill that needs to be updated. It is used to locate the specific bill in the database.
   * @param {any} body - The `body` parameter is an object that contains the updated data for the bill.
   * It can include any properties that need to be updated, such as the bill amount, due date, or any
   * other relevant information.
   * @returns an object with a "message" property set to "Bill Updated".
   */
  async updateBill(id: string, body: any) {
    try {
      await this.spbBillModel.updateOne({ _id: id }, body)
      return {
        message: "Bill Updated",
      }
    } catch (error) {
      let err_message = error.message ?? "Update Failed"
      throw new HttpException(err_message, error.status ?? 500)
    }
  }

  /**
   * The function deletes a bill with the specified ID and returns a success message or throws an error
   * if the deletion fails.
   * @param {string} bill_id - The `bill_id` parameter is a string that represents the unique
   * identifier of the bill that needs to be deleted.
   * @returns an object with a "message" property set to "Bill Deleted".
   */
  async deleteBill(bill_id: string) {
    try {
      await this.spbBillModel.deleteOne({ _id: bill_id });
      return {
        message: "Bill Deleted",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Deletion Failed", error.status ?? 500)
    }
  }

  /**
   * The function `getPersonWiseBillDetails` retrieves bill details for each person in a specified
   * group.
   * @param {string} group_id - The `group_id` parameter is a string that represents the unique
   * identifier of a group. It is used to fetch the bill details for each person in the group.
   * @returns an object with two properties: "data" and "message". The "data" property contains the
   * bill details grouped by person, with each person's ID as the key. The "message" property contains
   * a string message indicating that the user bills have been fetched.
   */
  async getPersonWiseBillDetails(group_id: string) {
    try {
      const [bill_group, bills_data] = await Promise.all([
        this.spbGroupModel.findOne({ _id: group_id }),
        this.spbBillModel.aggregate([
          {
            $match: { group_id }
          },
          {
            $unwind: "$persons"
          },
          {
            $group: {
              _id: "$persons.person_id",
              total: { $sum: "$persons.value" },
              bills: {
                $push: "$$ROOT"
              }
            }
          }
        ])
      ])
      let data = {}
      for (let person of bills_data) {
        data[person._id] = person
      }
      try {
        for (let person of bill_group.persons) {
          if (person["_id"] in data) {
            data[person["_id"]]["paid"] = person.paid ? person.paid : 0;
          }
        }
      } catch { }
      return {
        data,
        message: "Fetched User Bills",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Failed to fetch", error.status ?? 500)
    }
  }

  /**
   * The `deletePerson` function deletes a person from a group and updates the associated bills
   * accordingly.
   * @param {any} body - The `body` parameter is an object that contains the following properties:
   * @returns an object with a "message" property set to "Bill Deleted".
   */
  async deletePerson(body: any) {
    try {
      const bills_data = await this.spbBillModel.find(
        {
          $and: [
            { group_id: body.group_id },
            { persons: { $elemMatch: { person_id: body.person_id } } }
          ]
        },
      );
      let data_to_update = [], data_to_delete = [];
      for (let bill of bills_data) {
        if (bill.persons.length === 1) {
          data_to_delete.push(bill._id)
        } else {
          const person_ind = bill.persons.findIndex(e => e.person_id === body.person_id);
          if (person_ind !== -1) {
            let value_to_add: number = bill.persons[person_ind].value;
            bill.persons.splice(person_ind, 1)
            const persons_length = bill.persons.length
            for (let i = 0; i < persons_length; i++) {
              let person = bill.persons[i]
              const one_person_bill = Number((value_to_add / (persons_length - i)).toFixed(0));
              person.value += one_person_bill > 0 ? one_person_bill : 0;
              value_to_add -= one_person_bill
            }
            data_to_update.push({
              updateOne: {
                filter: {
                  _id: bill._id
                },
                update: {
                  persons: bill.persons
                }
              }
            })
          }
        }
      }

      await Promise.all([
        ...(data_to_update.length ? [
          this.spbBillModel.bulkWrite(data_to_update)
        ] : []),
        ...(data_to_delete.length ? [
          this.spbBillModel.deleteMany({ _id: { $in: data_to_delete } })
        ] : [])
      ])

      await this.spbGroupModel.updateOne(
        { _id: body.group_id },
        { $pull: { "persons": { "_id": body.person_id } } }
      )

      return {
        message: "Bill Deleted",
      }
    } catch (error) {
      throw new HttpException(error.message ?? "Deletion Failed", error.status ?? 500)
    }
  }

}
