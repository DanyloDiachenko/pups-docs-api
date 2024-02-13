import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    Post,
    UsePipes,
    ValidationPipe,
    Put, // Import Put decorator for update operations
    Req,
    UseGuards,
    Get, // Import Req to access the request object
} from '@nestjs/common';
import { Request } from 'express'; // Import Request type for type annotation
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

        // Create the user
        await this.authService.createUser(dto);

        // Immediately log in the new user and return the token
        const token = await this.authService.login(dto.email);
        return token; // This returns the token object, which includes the access_token
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('login')
    async login(@Body() { email, password }: AuthDto) {
        const { email: userEmail } = await this.authService.validateUser(
            email,
            password,
        ); // Corrected to match the returned property name
        return this.authService.login(userEmail);
    }

    // New route for updating user orders
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Put('update-orders') // Using PUT for update operations
    async updateOrders(@Req() req: Request, @Body() orderDto: UserOrderDto) {
        // Extract the user token from the request headers
        // This assumes you have some way of extracting the user ID from the token
        const token = req.headers.authorization?.split(' ')[1]; // Typically, the token is in the 'Authorization' header as 'Bearer TOKEN'
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        // Validate and decode the token to get the user ID
        // This step depends on how you handle tokens in your AuthService
        const userId = await this.authService.getUserIdFromToken(token);
        if (!userId) {
            throw new BadRequestException('Invalid token');
        }

        // Update the user's orders
        return this.authService.updateUserOrders(userId, orderDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('orders') // Using GET for retrieval operations
    async getUserOrders(@Req() req: Request) {
        // Extract the user token from the request headers
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new BadRequestException('No token provided');
        }

        // Use the existing method in AuthService to get the user ID from the token
        const userId = await this.authService.getUserIdFromToken(token);

        // Retrieve and return the user's orders
        return this.authService.getUserOrders(userId);
    }
}
