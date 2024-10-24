import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNS } from 'aws-sdk';
import * as twilio from 'twilio';

@Injectable()
export class NotificationService {
  constructor(private configService: ConfigService) {}

  getACCOUNTSID(): string {
    return this.configService.get<string>('ACCOUNT_SID');
  }
  getAUTHTOKEN(): string {
    return this.configService.get<string>('AUTH_TOKEN');
  }
  getNUMBER(): string {
    return this.configService.get<string>('TWILIO_NUMBER');
  }

  async sendNotification(phoneNumber: string, message: string) {
    try {
      const SID = this.getACCOUNTSID();
      const AUTHTOKEN = this.getAUTHTOKEN();
      const NUMBER = this.getNUMBER();
      const client = twilio(SID, AUTHTOKEN);
      await client.messages
        .create({
          body: message,
          from: NUMBER,
          to: phoneNumber,
        })
        .then((message: any) => {
          console.log(message);
        });
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
