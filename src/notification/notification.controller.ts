import {
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('create')
    @UsePipes(new ValidationPipe())
    async create(@Body() createNotificationDto: CreateNotificationDto) {
        return await this.notificationService.sendNotification(
            createNotificationDto,
        );
    }
}
