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

    /**
     * The function `insertTransaction` asynchronously inserts transaction data based on the type
     * (credit, debit, or estimation) for a specific user.
     * @param {string} user_id - The `user_id` parameter is a string that represents the unique
     * identifier of the user for whom the transaction is being inserted.
     * @param {string} type - The `type` parameter in the `insertTransaction` function determines the
     * type of transaction to be inserted. It can have one of the following values:
     * @param {any} data - The `data` parameter in the `insertTransaction` function represents the
     * information related to the transaction that you want to insert into the database. This data
     * could include details such as the amount, description, date, or any other relevant information
     * depending on the type of transaction (credit, debit, or estimation
     * @returns The `insertTransaction` function returns an object with a `message` property set to
     * "Created" and a `status` property set to `HttpStatus.CREATED` if the transaction is successfully
     * inserted into the corresponding model based on the `type` provided. If an error occurs during
     * the insertion process, it throws an `HttpException` with a message of "Creation Failed" and a
     * status code of 500
     */
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

    /**
     * This TypeScript function retrieves overall spend, income, and estimation data for a user within
     * a specified time frame.
     * @param {string} user_id - The `getOverallSpendsBetween` function you provided seems to be
     * fetching overall spend, income, and estimation data between a specified range for a given user
     * ID. It aggregates data from three different models (`userDebitsModel`, `userCreditsModel`,
     * `userEstimationModel`) based on the
     * @param {any} body - The `getOverallSpendsBetween` function is designed to retrieve overall
     * spending, income, and estimation data for a specific user within a given time frame. The
     * function aggregates data from three different models (`userDebitsModel`, `userCreditsModel`, and
     * `userEstimationModel`) based on the
     * @returns The `getOverallSpendsBetween` function returns an object containing information about
     * the overall spends, income, and estimations between specified dates for a given user. The object
     * includes day-wise data for spends, income, and estimations, as well as total, minimum, maximum,
     * and average values for each category. Additionally, a message indicating that all month overall
     * transactions have been fetched is included in the
     */
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
                    min: debit_data[0]?.min ?? {},
                    max: debit_data[0]?.max ?? {},
                    avg: debit_data[0]?.avg ?? 0,
                },
                income: {
                    day_wise: credit_data,
                    total: credit_data[0]?.total ?? 0,
                    min: credit_data[0]?.min ?? {},
                    max: credit_data[0]?.max ?? {},
                    avg: credit_data[0]?.avg ?? 0,
                },
                estimation: {
                    day_wise: estimation_data,
                    total: estimation_data[0]?.total ?? 0,
                    min: estimation_data[0]?.min ?? {},
                    max: estimation_data[0]?.max ?? {},
                    avg: estimation_data[0]?.avg ?? 0,
                },
                message: "Fetched All Month Overall Transactions",
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

    /**
     * The function `createOverallTransactionsDataAggregation` aggregates transaction data based on
     * user ID, category ID, and time range, calculating total, max, min, and average values along with
     * percentages.
     * @param {any} body - The `createOverallTransactionsDataAggregation` function is used to aggregate
     * transaction data based on the provided parameters in the `body` object. Here's a breakdown of
     * the aggregation pipeline stages used in the function:
     * @returns The function `createOverallTransactionsDataAggregation` is returning an array of
     * MongoDB aggregation pipeline stages. These stages are used to aggregate data from a collection
     * based on the provided criteria in the `body` object. The stages include matching documents based
     * on user_id, category_id, and created_at time range, sorting the documents, setting initial total
     * value, grouping data to calculate total, max, min,
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
                    min: { "$min": { value: "$value", category_id: "$category_id" } },
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
                $set: {
                    "max.percentage": {
                        "$multiply": [
                            { "$divide": ["$max.value", "$total"] },
                            100
                        ]
                    },
                    "min.percentage": {
                        "$multiply": [
                            { "$divide": ["$min.value", "$total"] },
                            100
                        ]
                    }
                }
            },
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
     * This TypeScript function retrieves month category-wise overall data for a user by aggregating
     * debit, credit, and estimation data.
     * @param {string} user_id - The `getMonthCategoryWiseOverallData` function is designed to fetch
     * overall data categorized by month for a specific user. It retrieves debit, credit, and
     * estimation data for each category based on the provided `user_id` and request body.
     * @param {any} body - The `getMonthCategoryWiseOverallData` function is an asynchronous function
     * that fetches debit, credit, and estimation data for a specific user based on the provided
     * `user_id` and `body` parameters. The `body` parameter is an object containing additional data
     * needed for the aggregation query.
     * @returns {
     *     data: {
     *         debits: { },
     *         credits: { },
     *         estimations: { }
     *     },
     *     message: "Fetched All Month Overall Category Wise Debits"
     * }
     */
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
     * This TypeScript function retrieves monthly category data based on the type (debit, estimation,
     * credit) for a specific user.
     * @param {string} user_id - The `user_id` parameter in the `getSingleCategoryMonthData` function
     * is a string that represents the unique identifier of the user for whom you want to fetch data.
     * This identifier is used to filter and retrieve specific data related to that user from the
     * database.
     * @param {any} body - The `getSingleCategoryMonthData` function is an asynchronous function that
     * retrieves data for a specific category and month based on the provided `user_id` and `body`
     * parameters. The `body` parameter is an object containing information about the type of data to
     * retrieve.
     * @returns The function `getSingleCategoryMonthData` is returning an object with the following
     * properties:
     * - `data`: an array of transaction data
     * - `total`: the total value from the transaction data (defaulted to 0 if not present)
     * - `min`: the minimum value from the transaction data (defaulted to 0 if not present)
     * - `max`: the maximum value from the transaction
     */
    async getSingleCategoryMonthData(user_id: string, body: any) {
        try {
            let type = "debit";
            if (body.type) {
                type = body.type
            }
            let data = [];
            if (type === "debit") {
                data = await this.userDebitsModel.aggregate(this.createOverallTransactionsDataAggregation({ ...body, user_id }))
            } else if (type === "estimation") {
                data = await this.userEstimationModel.aggregate(this.createOverallTransactionsDataAggregation({ ...body, user_id }))
            } else if (type === "credit") {
                data = await this.userCreditsModel.aggregate(this.createOverallTransactionsDataAggregation({ ...body, user_id }))
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
