import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_CREDITS_TABLE, UserCreditsModel } from './schemas/user-credits.schema';
import { Model } from 'mongoose';
import { USER_DEBITS_TABLE, UserDebitsModel } from './schemas/user-debits.schema';
import { USER_ESTIMATIONS_TABLE, UserEstimationsModel } from './schemas/user-estimations.schema';
import * as moment from "moment-timezone"

@Injectable()
export class TransactionsService {

    constructor(
        @InjectModel(USER_CREDITS_TABLE) private userCreditsModel: Model<UserCreditsModel>,
        @InjectModel(USER_DEBITS_TABLE) private userDebitsModel: Model<UserDebitsModel>,
        @InjectModel(USER_ESTIMATIONS_TABLE) private userEstimationModel: Model<UserEstimationsModel>
    ) { }

    /**
     * The function `insertTransaction` inserts a transaction into the appropriate model based on the
     * given type, and returns a success message and status code.
     * @param {string} type - The `type` parameter is a string that specifies the type of transaction
     * to be inserted. It can have one of the following values: "credit", "debit", or "estimation".
     * @param {any} data - The `data` parameter is an object that contains the information needed to
     * create a transaction. The structure of the `data` object will depend on the type of transaction
     * being created (credit, debit, or estimation).
     * @returns an object with two properties: "message" and "status". The "message" property contains
     * the string "Created" and the "status" property contains the value of the constant
     * "HttpStatus.CREATED".
     */
    async insertTransaction(type: string, data: any) {
        try {
            if (type === "credit") {
                await this.userCreditsModel.create(data)
            } else if (type === "debit") {
                await this.userDebitsModel.create(data)
            } else if (type === "estimation") {
                await this.userEstimationModel.create(data)
            } else {
                throw new Error("Invalid Type")
            }
            return {
                message: "Created",
                status: HttpStatus.CREATED
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Creation Failed", error.status ?? 500)
        }
    }

    /**
     * The function `updateTransaction` updates a transaction based on its type (credit, debit, or
     * estimation) and returns a success message and status code.
     * @param {string} type - The `type` parameter is a string that specifies the type of transaction.
     * It can have three possible values: "credit", "debit", or "estimation".
     * @param id - The `id` parameter is the unique identifier of the transaction that needs to be
     * updated. It is used to identify the specific transaction record in the database that needs to be
     * updated.
     * @param {any} data - The `data` parameter is an object that contains the updated information for
     * the transaction. It can include any properties that need to be updated in the respective model
     * based on the `type` of transaction.
     * @returns an object with two properties: "message" and "status". The "message" property contains
     * the string "Created" and the "status" property contains the value HttpStatus.OK.
     */
    async updateTransaction(type: string, id, data: any) {
        try {
            if (type === "credit") {
                await this.userCreditsModel.updateOne({ _id: id }, data)
            } else if (type === "debit") {
                await this.userDebitsModel.updateOne({ _id: id }, data)
            } else if (type === "estimation") {
                await this.userEstimationModel.updateOne({ _id: id }, data)
            } else {
                throw new Error("Invalid Type")
            }
            return {
                message: "Created",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Update Failed", error.status ?? 500)
        }
    }

    /**
     * The function `deleteTransaction` deletes a transaction based on its type and ID, and returns a
     * success message and status.
     * @param {string} type - The `type` parameter is a string that specifies the type of transaction
     * to be deleted. It can have three possible values: "credit", "debit", or "estimation".
     * @param id - The `id` parameter is the unique identifier of the transaction that you want to
     * delete. It is used to specify which transaction should be deleted from the respective model
     * based on the `type` parameter.
     * @returns an object with two properties: "message" and "status". The "message" property contains
     * the string "Deleted" and the "status" property contains the value of the HttpStatus.OK constant.
     */
    async deleteTransaction(type: string, id) {
        try {
            if (type === "credit") {
                await this.userCreditsModel.deleteOne({ _id: id })
            } else if (type === "debit") {
                await this.userDebitsModel.deleteOne({ _id: id })
            } else if (type === "estimation") {
                await this.userEstimationModel.deleteOne({ _id: id })
            } else {
                throw new Error("Invalid Type")
            }
            return {
                message: "Deleted",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Deleting Failed", error.status ?? 500)
        }
    }

    /**
     * The function retrieves overall spend, income, and estimation data between specified dates.
     * @param {any} body - The `body` parameter is an object that contains the filters and criteria for
     * fetching the overall spends between a certain period. It may include properties such as start
     * date, end date, user ID, category, etc. These properties are used to create the aggregation
     * pipeline for fetching the data from different models (`
     * @returns an object with the following properties:
     */
    async getOverallSpendsBetween(body: any) {
        try {
            const [debit_data, credit_data, estimation_data] = await Promise.all([
                this.userDebitsModel.aggregate(this.createOverallTransactionsDataAggregation(body)),
                this.userCreditsModel.aggregate(this.createOverallTransactionsDataAggregation(body)),
                this.userEstimationModel.aggregate(this.createOverallTransactionsDataAggregation(body))
            ])
            return {
                spend: {
                    day_wise: debit_data,
                    total: debit_data[0]?.total ?? 0,
                    min: debit_data[0]?.min ?? 0,
                    max: debit_data[0]?.max ?? 0,
                    avg: debit_data[0]?.avg ?? 0,
                },
                income: {
                    day_wise: credit_data,
                    total: credit_data[0]?.total ?? 0,
                    min: credit_data[0]?.min ?? 0,
                    max: credit_data[0]?.max ?? 0,
                    avg: credit_data[0]?.avg ?? 0,
                },
                estimation: {
                    day_wise: estimation_data,
                    total: estimation_data[0]?.total ?? 0,
                    min: estimation_data[0]?.min ?? 0,
                    max: estimation_data[0]?.max ?? 0,
                    avg: estimation_data[0]?.avg ?? 0,
                },
                message: "Fetched All Month Overall Transactions",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

    /**
     * The function creates an aggregation pipeline in MongoDB to aggregate overall transaction data
     * within a specified time range for a given user.
     * @param {any} body - The `body` parameter is an object that contains the following properties:
     * @returns an array of aggregation pipeline stages.
     */
    private createOverallTransactionsDataAggregation(body: any): any {
        const one_day_in_sec = 60 * 60 * 24;
        return [
            {
                $match: {
                    "user_id": body.user_id,
                    ...(body.category_id && { category_id: body.category_id }),
                    "created_at": { $gt: moment.utc(body.start_time).toDate(), $lte: moment.utc(body.end_time).toDate() }
                }
            },
            {
                $sort: { "created_at": 1 }
            },
            {
                $set: {
                    total: 0
                }
            },
            {
                $group: {
                    _id: null,
                    total_data: {
                        $push: "$$ROOT"
                    },
                    total: { $sum: "$value" },
                    max: { "$max": { value: "$value", category_id: "$category_id" } },
                    min: { "$min": "$value" },
                    avg: { "$avg": "$value" }
                }
            },
            { $unset: "_id" },
            {
                $addFields: {
                    day: {
                        $range: [
                            { $toInt: { $divide: [{ $toLong: moment.utc(body.start_time).toDate() }, 1000] } },
                            { $toInt: { $divide: [{ $toLong: moment.utc(body.end_time).toDate() }, 1000] } },
                            one_day_in_sec
                        ]
                    }
                }
            },
            {
                $set: {
                    day: {
                        $map: {
                            input: "$day",
                            in: { $toDate: { $multiply: ["$$this", 1000] } }
                        }
                    }
                }
            },
            { $unwind: "$day" },
            {
                $project: {
                    data: {
                        $filter: {
                            input: "$total_data",
                            cond: {
                                $and: [
                                    { $gt: ["$$this.created_at", "$day"] },
                                    { $lte: ["$$this.created_at", { $add: ["$day", 1000 * one_day_in_sec] }] },
                                ]
                            }
                        },
                    },
                    day: 1,
                    total: 1,
                    min: 1,
                    max: 1,
                    avg: 1
                },
            },
            {
                $match: {
                    $expr: {
                        $gt: [{ $size: "$data" }, 0]
                    }
                }
            }
        ]
    }

    /**
     * The function `getYearAverage` calculates the average value of debit transactions for a given
     * user within a specified time range.
     * @param {any} body - The `body` parameter is an object that contains the following properties:
     * @returns an object with the following properties:
     * - average: The average value of the debit transactions for the specified user and time range.
     * - message: A message indicating that all month overall transactions have been fetched.
     * - status: The HTTP status code indicating the success of the operation (HttpStatus.OK).
     */
    async getYearAverage(body: any) {
        try {
            let debit_data = await this.userDebitsModel.aggregate([
                {
                    $match: {
                        "user_id": body.user_id,
                        "created_at": { $gt: moment.utc(body.start_time).toDate(), $lte: moment.utc(body.end_time).toDate() }
                    },
                },
                {
                    $set: {
                        average: 0
                    }
                },
                {
                    $group: {
                        _id: null,
                        average: { $avg: "$value" },
                    }
                },
            ])
            return {
                average: debit_data[0]?.average ? debit_data[0].average : 0,
                message: "Fetched All Month Overall Transactions",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

    /**
     * The function `getMonthCategoryWiseDebits` retrieves aggregated debit data for a specific user
     * within a given time range, grouped by category.
     * @param {any} body - The `body` parameter is an object that contains the following properties:
     * @returns an object with the following properties:
     * - data: an object containing the aggregated data grouped by category_id
     * - message: a string message indicating the success of the operation
     * - status: an HTTP status code indicating the success of the operation (HttpStatus.OK)
     */
    async getMonthCategoryWiseDebits(body: any) {
        try {
            let query_data = await this.userDebitsModel.aggregate([
                {
                    $match: {
                        "user_id": body.user_id,
                        "created_at": { $gt: moment.utc(body.start_time).toDate(), $lte: moment.utc(body.end_time).toDate() }
                    },
                },
                {
                    $set: {
                        total: 0
                    }
                },
                {
                    $group: {
                        _id: "$category_id",
                        count: { $sum: 1 },
                        total: { $sum: "$value" },
                        max: { "$max": "$value" },
                        min: { "$min": "$value" },
                        avg: { "$avg": "$value" }
                    }
                },

            ])
            let data = {}
            for (let item of query_data) {
                data[item._id] = item
            }
            return {
                data,
                message: "Fetched All Month Overall Category Wise Debits",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

    /**
     * The function `getSingleCategoryMonthData` fetches data for a single category for a specific
     * month and returns aggregated information about the transactions.
     * @param {any} body - The `body` parameter is an object that contains the necessary information
     * for fetching the single category month data. It may include properties such as the category
     * name, month, and any other relevant filters or options needed for the query.
     * @returns an object with the following properties:
     * - data: The result of the aggregation query performed on the userDebitsModel.
     * - total: The total value from the data array, or 0 if it is undefined.
     * - min: The minimum value from the data array, or 0 if it is undefined.
     * - max: The value of the max property from the first element of
     */
    async getSingleCategoryMonthData(body: any) {
        try {
            let data = await this.userDebitsModel.aggregate(this.createOverallTransactionsDataAggregation(body))
            return {
                data,
                total: data[0]?.total ?? 0,
                min: data[0]?.min ?? 0,
                max: data[0]?.max?.value ?? 0,
                avg: data[0]?.avg ?? 0,
                message: "Fetched All Month Category Debits",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

}
