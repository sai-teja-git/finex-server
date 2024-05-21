import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from 'src/common/services/notification.service';
import { USER_TABLE, UserModel } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import * as bcrypt from 'bcrypt';
import { CATEGORY_TABLE, CategoryModel } from 'src/category/schemas/category.schema';
import { USER_CATEGORY_TABLE, UserCategoryModel } from 'src/user-category/schemas/user-category.schema';

@Injectable()
export class PasswordService {

    constructor(
        @InjectModel(USER_TABLE)
        private readonly userModel: Model<UserModel>,

        @InjectModel(CATEGORY_TABLE)
        private readonly categoryModel: Model<CategoryModel>,

        @InjectModel(USER_CATEGORY_TABLE)
        private readonly userCategoryModel: Model<UserCategoryModel>,

        private readonly jwtService: JwtService,
        private readonly notificationService: NotificationService
    ) { }

    /**
     * The function `sendForgetPassword` sends a reset password link to a user's email address after
     * verifying the user's username and email.
     * @param {any} body - The `body` parameter in the `sendForgetPassword` function likely contains
     * information such as `user_name` and `email` needed to send a reset password link to a user. This
     * function is responsible for finding a user by their `user_name`, verifying their email,
     * generating a token for password
     * @returns The function `sendForgetPassword` is returning an object with the properties `message`
     * and `status`. The `message` property is set to "Reset link sent" and the `status` property is
     * set to HttpStatus.CREATED.
     */
    async sendForgetPassword(body: any) {
        try {
            const user_data = await this.userModel.findOne({
                user_name: body.user_name
            })

            if (!user_data) throw new HttpException("User Name not found", HttpStatus.FORBIDDEN);

            if (user_data.email !== body.email) throw new HttpException("Mail is not linked with this username", HttpStatus.FORBIDDEN);

            const token = this.jwtService.sign({ user_id: user_data._id }, { expiresIn: "5m", secret: env.JWT_SECRET_KEY })

            const params = new URLSearchParams({
                code: token,
                verification: "password"
            }).toString()

            const link = `${env.UI_DOMAIN}/reset-password?${params}`;

            let mail_body = {
                to: [
                    body.email,
                ],
                title: "Reset password",
                subject: "Update your password",
                template: "forget_password",
                "context": {
                    "name": user_data.name,
                    "link": encodeURI(link),
                    "attachments": []
                }
            }
            await this.sendInvitation(mail_body)
            return {
                message: "Reset link sent",
                status: HttpStatus.CREATED
            }
        } catch (error) {
            let err_message = error.message ? error.message : "Failed To send link"
            throw new HttpException(err_message, error.status ?? 500)
        }
    }

    /**
     * This TypeScript function updates a user's password after verifying a code and checking certain
     * conditions.
     * @param {any} body - The `setUserPassword` function you provided is responsible for updating a
     * user's password based on certain conditions. The function expects a `body` parameter, which
     * should contain the following properties:
     * @returns {
     *     status: HttpStatus.CREATED,
     *     message: "User Password Updated",
     * }
     */
    async setUserPassword(body: any) {
        try {
            if (body.verification !== "password") {
                throw new BadRequestException("Link is expired or invalid!")
            }
            const payload: any = await this.jwtService.verifyAsync(body.code, { secret: env.JWT_SECRET_KEY });

            const user = await this.userModel.findOne({ _id: payload.user_id })

            if (!user) throw new NotFoundException("Requested user was not found!");

            if (!user.verified) throw new HttpException("User Not Verified", HttpStatus.FORBIDDEN);

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(body["password"], saltRounds);
            if (user.password === hashedPassword) {
                throw new BadRequestException("New Password can't be old one, try another")
            }
            await this.userModel.updateOne({ _id: payload.user_id }, {
                password: hashedPassword
            })
            return {
                status: HttpStatus.CREATED,
                message: "User Password Updated",
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Invalid Link", error.status ?? 500)
        }
    }

    async changePassword(headers, data) {
        const saltRounds = 10
        try {
            let user_data = await this.userModel.findOne({ _id: headers.user }).exec();
            if (!(await bcrypt.compare(data["old_password"], user_data["password"]))) {
                throw new HttpException("Invalid Old Password", HttpStatus.FORBIDDEN)
            }
            let new_password = await bcrypt.hash(data["new_password"], saltRounds);
            if ((await bcrypt.compare(data["old_password"], new_password))) throw new HttpException("New Password Can't be old password, try another", HttpStatus.FORBIDDEN);
            await this.userModel.updateOne({ _id: headers.user }, {
                password: new_password
            })
            return {
                message: "User Details Updated",
                status: HttpStatus.OK
            }
        } catch (error) {
            throw new HttpException(error.message, error.status ?? 500)
        }
    }

    /**
     * The function `verifyUser` in TypeScript verifies a user's account using a JWT token and updates
     * their status to verified while handling various error scenarios.
     * @param {any} req_data - The `req_data` parameter in the `verifyUser` function seems to contain
     * information required for verifying a user. It likely includes a code that needs to be decoded and
     * verified, as well as a password for the user. The function performs various tasks such as decoding
     * the code, verifying it, updating
     * @returns {
     *   message: "User Verified",
     *   status: HttpStatus.CREATED,
     * }
     */
    async verifyUser(req_data: any) {
        const saltRounds = 10
        try {
            if (req_data.verification !== "email") {
                throw new Error("Invalid Link")
            }
            let payload: any = this.jwtService.decode(req_data.code)
            try {
                await this.jwtService.verifyAsync(
                    req_data.code,
                    {
                        secret: env.JWT_SECRET_KEY
                    }
                );
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    throw new Error("Link Expired")
                } else {
                    throw new Error("Invalid Link")
                }
            }
            let user_data = await this.userModel.findOne({
                _id: payload.user_id
            })
            if (user_data.verified) {
                throw new Error("User Already Verified")
            }
            let password = await bcrypt.hash(req_data["password"], saltRounds);
            try {
                await this.userModel.updateOne({ _id: payload.user_id }, {
                    verified: true,
                    password
                })
            } catch {
                throw new Error("Invalid Link")
            }
            let categories = await this.categoryModel.find().exec();
            categories = JSON.parse(JSON.stringify(categories))
            let user_category_to_insert = categories.map(category => {
                try {
                    delete category._id
                } catch { }
                try {
                    delete category["created_at"]
                } catch { }
                try {
                    delete category["updated_at"]
                } catch { }
                return Object.assign({ user_id: payload.user_id }, category)
            })
            try {
                await this.userCategoryModel.insertMany(user_category_to_insert)
            } catch (error) {
                try {
                    await this.userModel.updateOne({ _id: payload.user_id }, {
                        verified: false
                    })
                } catch {
                    throw new Error("Invalid Link")
                }
                throw new Error(error.message ?? "Invalid Link")
            }
            return {
                message: "User Verified",
                status: HttpStatus.CREATED,
            }
        } catch (error) {
            throw new HttpException(error.message ?? "Invalid Link", error.status ?? 500)
        }

    }


    /**
       * The function `sendMail` sends a templated email using the `mailService` and returns a response
       * object with the envelope and message ID.
       * @param body - The `body` parameter is the data that contains the necessary information for sending
       * the email. It could include details such as the recipient's email address, the subject of the
       * email, the content of the email, and any other relevant information needed for sending the email.
       * @returns an object with the following properties:
       * - message: "Mail Sent"
       * - status: HttpStatus.CREATED
       * - data: an object with the properties envelope and messageId, which are obtained from the
       * mail_data object returned by the mailService.sendTemplatedEmail() function.
       */
    private async sendInvitation(body: Record<string, any>) {
        try {
            let mail_data = await this.notificationService.sendTemplatedEmail(body)
            return {
                message: "Mail Sent",
                status: HttpStatus.CREATED,
                data: {
                    envelope: mail_data.envelope,
                    messageId: mail_data.messageId
                }
            }
        } catch (error) {
            throw new HttpException(error.message, error.status ?? 500)
        }
    }
}
