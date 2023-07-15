import { Injectable } from '@nestjs/common';
import * as nodemailer from "nodemailer";
import * as nodemailerMjml from "nodemailer-mjml";
import * as path from "path";

@Injectable()
export class MailService {


    /**
     * The function `sendTemplatedEmail` sends an email using nodemailer with a template and optional
     * attachments.
     * @param {any} email_data - The `email_data` parameter is an object that contains the following
     * properties:
     * @returns the result of the `transporter.sendMail(mailOptions)` method, which is a Promise that
     * resolves to the information about the sent email.
     * 
     * ### Eg body 
     * ```ts
     * let body = {
     *      "to": [
     *          "saitejaspl1223@gmail.com"
     *      ],
     *      "subject": "Testing Mail",
     *      "template": "test_temp",
     *      "context": {
     *          "name": "Chandra Sekhar",
     *          "verifyLink": "https://tailwindcss.com/docs/customizing-colors",
     *          "attachments": []
     *      }
     * }
     * ```
     */
    async sendTemplatedEmail(email_data: any) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        if (email_data.template) {
            transporter.use(
                'compile',
                nodemailerMjml.nodemailerMjmlPlugin({
                    templateFolder: path.resolve('src/common/mail-templates/'),
                }),
            );
        }

        let attachments = []
        if (email_data.attachments) {
            attachments = email_data?.context?.attachments?.map((atta: any) => {
                return {
                    filename: atta.file_name,
                    content: atta.file_data,
                    encoding: 'base64',
                };
            }) || [];
        }

        const mailOptions = {
            from: `${email_data.title ? email_data.title : "notification"} <${process.env.EMAIL_USER}>`,
            to: email_data.to,
            subject: email_data.subject,
            text: email_data.message,
            templateName: email_data.template,
            templateData: email_data.context,
            attachments: attachments,
        };

        const mailSent = await transporter.sendMail(mailOptions);
        return mailSent;
    }

}
