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
     * The function retrieves overall spends, income, and estimations between a specified start and end
     * time for a given user.
     * @param {any} body - {
     * @returns an object with the following properties:
     */
    async getOverallSpendsBetween(body: any) {
        try {
            let debit_data = await this.userDebitsModel.aggregate([
                {
                    $match: {
                        "user_id": body.user_id,
                        "created_at": { $gt: moment.utc(body.start_time).toDate(), $lte: moment.utc(body.end_time).toDate() }
                    }
                },
                {
                    $set: {
                        total: 0
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: "$$ROOT"
                        },
                        total: { $sum: "$value" }
                    }
                },
            ])
            return {
                spend: {
                    data: debit_data[0]?.data ?? [],
                    total: debit_data[0]?.total ?? 0,
                },
                // income: {
                //     data: credit_data[0]?.data ?? [],
                //     total: credit_data[0]?.total ?? 0,
                // },
                // estimation: {
                //     data: estimation_data[0]?.data ?? [],
                //     total: estimation_data[0]?.total ?? 0,
                // },
                message: "Created",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Failed to fetch data", error.status ?? 500)
        }
    }

}
