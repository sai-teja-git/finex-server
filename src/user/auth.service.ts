import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import { Model } from 'mongoose';
import { USER_TABLE, UserModel } from './schemas/user.schema';


@Injectable()
export class AuthService {

    constructor(
        @InjectModel(USER_TABLE)
        private readonly userModel: Model<UserModel>,

        private readonly jwtService: JwtService,
    ) { }

    /**
     * The `login` function in TypeScript handles user authentication by verifying credentials,
     * generating a JWT token, updating the last login timestamp, and returning user data along with
     * the token.
     * @param body - The `login` function you provided is an asynchronous function that handles user
     * authentication. It takes a `body` parameter which likely contains user input data such as
     * username and password for authentication.
     * @returns The `login` function is returning an object with the following properties:
     * - `message`: A string value indicating the status of the login attempt, in this case "Success".
     * - `status`: The HTTP status code, in this case `HttpStatus.OK`.
     * - `data`: An object containing user data including:
     *   - `token`: A JWT token generated using `jwtService.sign`.
     *   - `
     */
    async login(body) {
        try {
            let user_data = await this.userModel.findOne({ user_name: body["user_name"] }).exec();

            if (!user_data) throw new HttpException("Invalid Credentials", HttpStatus.FORBIDDEN);

            if (!user_data.verified) new HttpException("User Not Verified", HttpStatus.FORBIDDEN);

            if (!(await bcrypt.compare(body["password"], user_data["password"]))) {
                throw new HttpException("Invalid Credentials", HttpStatus.FORBIDDEN)
            }

            const token = this.jwtService.sign({
                username: body["user_name"],
                user: user_data["_id"]
            })
            await this.userModel.updateOne({ _id: user_data["_id"] }, { last_login: moment.utc() })
            return {
                message: "Success",
                status: HttpStatus.OK,
                data: {
                    token,
                    name: user_data["name"],
                    email: user_data["email"],
                    last_login: user_data["last_login"],
                    currency_id: user_data["currency_id"],
                    currency_code: user_data["currency_code"],
                    currency_name: user_data["currency_name"],
                    currency_name_plural: user_data["currency_name_plural"],
                    currency_decimal_digits: user_data["currency_decimal_digits"],
                    time_zone: user_data["time_zone"],
                    time_zone_id: user_data["time_zone_id"],
                    theme: user_data["theme"]
                }
            }
        } catch (error) {
            throw new HttpException(error.message, error.status ?? 500)
        }
    }

}
