import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { AuthDto } from './dto/auth.dto';
import { UserModel } from './user.model';
import { genSalt, hash, compare } from 'bcryptjs';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './auth.constants';
import { JwtService } from '@nestjs/jwt';
import { UserOrderDto } from './dto/order.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(UserModel)
        private readonly userModel: ModelType<UserModel>,
        private readonly jwtService: JwtService,
    ) {}

    async createUser(dto: AuthDto) {
        const salt = await genSalt(10);
        const newUser = new this.userModel({
            email: dto.email,
            passwordHash: await hash(dto.password, salt),
            orders: [],
        });
        return newUser.save();
    }

    async findUser(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    async validateUser(
        email: string,
        password: string,
    ): Promise<Pick<UserModel, 'email'>> {
        const user = await this.findUser(email);
        if (!user) {
            throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
        }
        const isCorrectPassword = await compare(password, user.passwordHash);
        if (!isCorrectPassword) {
            throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
        }
        return { email: user.email };
    }

    async login(email: string) {
        const payload = { email };
        return {
            token: await this.jwtService.signAsync(payload),
        };
    }

    async getUserIdFromToken(token: string): Promise<string> {
        try {
            // Verify the token and decode its payload
            const decoded = await this.jwtService.verifyAsync(token);
            // Assume the payload contains the user's email as 'email'
            const email = decoded.email;
            // Find the user by email to get the user ID
            const user = await this.findUser(email);
            if (!user) {
                throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
            }
            return user.id; // Assuming the user document contains the ID as 'id'
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async updateUserOrders(userId: string, orderDto: UserOrderDto) {
        // Find the user by their ID
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Add the new order to the user's orders array
        user.orders.push(orderDto);

        // Save the updated user document back to the database
        await user.save();

        return {
            success: true,
            data: user.orders,
        }; // Optionally, return the updated orders array
    }

    async getUserOrders(userId: string) {
        // Find the user by their ID
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Return the user's orders
        return {
            success: true,
            data: user.orders,
        };
    }
}
