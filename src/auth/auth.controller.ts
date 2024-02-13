import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    Post,
    UsePipes,
    ValidationPipe,
    Put,
    Req,
    UseGuards,
    Get,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { UserOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ALREADY_REGISTERED_ERROR } from './auth.constants';

@Controller('users')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UsePipes(new ValidationPipe())
    @Post('register')
    async register(@Body() dto: AuthDto) {
        const oldUser = await this.authService.findUser(dto.email);
        if (oldUser) {
            throw new BadRequestException(ALREADY_REGISTERED_ERROR);
        }

        await this.authService.createUser(dto);

        const token = await this.authService.login(dto.email);

        return token;
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('login')
    async login(@Body() { email, password }: AuthDto) {
        const { email: userEmail } = await this.authService.validateUser(
            email,
            password,
        );

        return this.authService.login(userEmail);
    }

    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Put('update-orders')
    async updateOrders(@Req() req: Request, @Body() orderDto: UserOrderDto) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        const userId = await this.authService.getUserIdFromToken(token);
        if (!userId) {
            throw new BadRequestException('Invalid token');
        }

        return this.authService.updateUserOrders(userId, orderDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('orders')
    async getUserOrders(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        const userId = await this.authService.getUserIdFromToken(token);

        return this.authService.getUserOrders(userId);
    }
}
