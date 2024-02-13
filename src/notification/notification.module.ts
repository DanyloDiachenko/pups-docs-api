import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    controllers: [NotificationController],
    imports: [ConfigModule],
    providers: [NotificationService],
})
export class NotificationModule {}
