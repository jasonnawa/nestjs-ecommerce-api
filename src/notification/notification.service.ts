import { Injectable } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import * as twilio from 'twilio';

@Injectable()
export class NotificationService {
  //private sns: SNS;
  //private twilioClient: Twilio.Twilio;

  /*constructor() {
    //this.sns = new SNS({ region: 'us-east-1' }); // e.g., 'us-east-1'
    this.twilioClient = twilio(
      'AC97672c9bb2fe2fba5f1777d5a41db8bf',
      '2b432808eccad8538b93735007fe1c85',
    );
  }*/

  async sendNotification(phoneNumber: string, message: string) {
    console.log(`phonenumber:${phoneNumber}, message: ${message}`);
    // Publish to SNS
    // await this.sns
    // .publish({
    // Message: message,
    // TopicArn: 'your_sns_topic_arn', // Replace with your SNS Topic ARN
    // })
    // .promise();
    try {
      const client = twilio(
        'AC97672c9bb2fe2fba5f1777d5a41db8bf',
        '2b432808eccad8538b93735007fe1c85',
      );
      await client.messages
        .create({
          body: message,
          from: '+18566662117', // Your Twilio number
          to: phoneNumber,
        })
        .then((message: any) => {
          console.log(message);
        });
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }

    // Send SMS via Twilio
  }
}
