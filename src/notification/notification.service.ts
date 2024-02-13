import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
    constructor(private readonly configService: ConfigService) {}

    async sendNotification(notificationData: CreateNotificationDto) {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'danildiachenko23@gmail.com',
                pass: this.configService.get('EMAIL_PASSWORD'),
            },
        });

        const mailOptions = {
            from: notificationData.email,
            to: 'danildiachenko23@gmail.com',
            subject: notificationData.subject,
            text: `
                Name: ${notificationData.name}\n
                Email: ${notificationData.email}\n
                Message: ${notificationData.message}
            `,
        };

        await transporter.sendMail(mailOptions);

        return {
            success: true,
        };
    }
}
