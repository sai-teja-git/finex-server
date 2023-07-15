import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService } from './common/services/mail/mail.service';

@Injectable()
export class AppService {

  constructor(
    private readonly mailService: MailService
  ) { }

  async sendMail(body) {
    try {
      let mail_data = await this.mailService.sendTemplatedEmail(body)
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
