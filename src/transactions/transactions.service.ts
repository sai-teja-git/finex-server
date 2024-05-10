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
        @InjectModel(USER_CREDITS_TABLE)
        private userCreditsModel: Model<UserCreditsModel>,

        @InjectModel(USER_DEBITS_TABLE)
        private userDebitsModel: Model<UserDebitsModel>,

        @InjectModel(USER_ESTIMATIONS_TABLE)
        private userEstimationModel: Model<UserEstimationsModel>
    ) { }

    async insertTransaction(user_id: string, type: string, data: any) {
        try {
            if (type === "credit") {
                await this.userCreditsModel.create({ ...data, user_id })
            } else if (type === "debit") {
                await this.userDebitsModel.create({ ...data, user_id })
            } else if (type === "estimation") {
                await this.userEstimationModel.create({ ...data, user_id })
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
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Deleting Failed", error.status ?? 500)
        }
    }

    async getOverallSpendsBetween(user_id: string, body: any) {
        try {
            const [debit_data, credit_data, estimation_data] = await Promise.all([
                this.userDebitsModel.aggregate(this.createOverallTransactionsDataAggregation({ ...body, user_id })),
                this.userCreditsModel.aggregate(this.createOverallTransactionsDataAggregation({ ...body, user_id })),
                this.userEstimationModel.aggregate(this.createOverallTransactionsDataAggregation({ ...body, user_id }))
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

    async getMonthCategoryWiseDebits(user_id: string, body: any) {
        try {
            let query_data = await this.userDebitsModel.aggregate(this.categoryWiseAggregation({ ...body, user_id }))
            let data = {}
            for (let item of query_data) {
                data[item._id] = item
            }
            return {
                data,
                message: "Fetched All Month Overall Category Wise Debits",
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

    async getMonthCategoryWiseOverallData(user_id: string, body: any) {
        try {
            const [debit_data, credit_data, estimation_data] = await Promise.all([
                this.userDebitsModel.aggregate(this.categoryWiseAggregation({ ...body, user_id })),
                this.userCreditsModel.aggregate(this.categoryWiseAggregation({ ...body, user_id })),
                this.userEstimationModel.aggregate(this.categoryWiseAggregation({ ...body, user_id }))
            ])
            let data = {
                debits: {},
                credits: {},
                estimations: {}
            }
            for (let item of debit_data) {
                data.debits[item._id] = item
            }
            for (let item of credit_data) {
                data.credits[item._id] = item
            }
            for (let item of estimation_data) {
                data.estimations[item._id] = item
            }
            return {
                data,
                message: "Fetched All Month Overall Category Wise Debits",
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

    /**
     * The function performs category-wise aggregation on a given dataset based on user ID, start time,
     * and end time.
     * @param {any} body - The `body` parameter is an object that contains the following properties:
     * @returns an array of aggregation stages for MongoDB.
     */
    categoryWiseAggregation(body: any) {
        return [
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

        ]
    }

    /**
     * The function `getSingleCategoryMonthData` retrieves data for a specific category in a given
     * month, including total, minimum, maximum, and average values.
     * @param {any} body - The `body` parameter is an object that contains the request body data. It is
     * used to determine the type of data to fetch (spends, estimations, or income) and to provide
     * additional filters or criteria for the data aggregation.
     * @returns an object with the following properties:
     * - data: an array of aggregated transaction data
     * - total: the total value of the transactions (defaulting to 0 if not present)
     * - min: the minimum value of the transactions (defaulting to 0 if not present)
     * - max: the maximum value of the transactions (defaulting to 0 if not present)
     * - avg
     */
    async getSingleCategoryMonthData(body: any) {
        try {
            let type = "spends";
            if (body.type) {
                type = body.type
            }
            let data = [];
            if (type === "spends") {
                data = await this.userDebitsModel.aggregate(this.createOverallTransactionsDataAggregation(body))
            } else if (type === "estimations") {
                data = await this.userEstimationModel.aggregate(this.createOverallTransactionsDataAggregation(body))
            } else if (type === "income") {
                data = await this.userCreditsModel.aggregate(this.createOverallTransactionsDataAggregation(body))
            }
            return {
                data,
                total: data[0]?.total ?? 0,
                min: data[0]?.min ?? 0,
                max: data[0]?.max?.value ?? 0,
                avg: data[0]?.avg ?? 0,
                message: "Fetched Month All Category Details",
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

}
