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
    Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AuthDto } from './dto/auth.dto';
import { Order } from './user.model';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ALREADY_REGISTERED_ERROR } from './users.constants';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('users')
export class AuthController {
    constructor(private readonly usersService: UsersService) {}

    @UsePipes(new ValidationPipe())
    @Post('register')
    async register(@Body() dto: AuthDto) {
        const oldUser = await this.usersService.findUser(dto.email);
        if (oldUser) {
            throw new BadRequestException(ALREADY_REGISTERED_ERROR);
        }

        await this.usersService.createUser(dto);

        const token = await this.usersService.login(dto.email);

        return token;
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('login')
    async login(@Body() { email, password }: AuthDto) {
        const { email: userEmail } = await this.usersService.validateUser(
            email,
            password,
        );

        return this.usersService.login(userEmail);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update-password')
    async updatePassword(
        @Req() req: Request,
        @Body('password') newPassword: string,
    ) {
        if (!newPassword) {
            throw new BadRequestException('New password is required');
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        const userId = await this.usersService.getUserIdFromToken(token);
        if (!userId) {
            throw new BadRequestException('Invalid token');
        }

        await this.usersService.updateUserPassword(userId, newPassword);

        return { success: true, message: 'Password updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('create-order')
    async createOrder(@Req() req: Request, @Body() orderDto: CreateOrderDto) {
        const token = req.headers.authorization?.split(' ')[1];

        const userId = await this.usersService.getUserIdFromToken(token);
        if (!userId) {
            throw new BadRequestException('Invalid token');
        }

        return this.usersService.createUserOrder(userId, orderDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('orders')
    async getUserOrders(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        const userId = await this.usersService.getUserIdFromToken(token);

        return this.usersService.getUserOrders(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete-order')
    async deleteUserOrder(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        const userId = await this.usersService.getUserIdFromToken(token);
        const orderId: string = req.body.orderId;
        await this.usersService.deleteUserOrder(userId, Number(orderId));

        return this.usersService.getUserOrders(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-email')
    async getEmail(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        try {
            const email = await this.usersService.getEmailFromToken(token);
            return { success: true, email };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
