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
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './users.constants';
import { JwtService } from '@nestjs/jwt';
import { OrderStatus } from './dto/orderStatus';
import { Order } from './user.model';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class UsersService {
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

    async updateUserPassword(userId: string, newPassword: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const salt = await genSalt(10);
        user.passwordHash = await hash(newPassword, salt);

        await user.save();
    }

    async getUserIdFromToken(token: string): Promise<string> {
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            const email = decoded.email;

            const user = await this.findUser(email);

            if (!user) {
                throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
            }

            return user.id;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async createUserOrder(userId: string, orderDto: CreateOrderDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const newOrder = new Order();

        if (orderDto.readyPupsVersion) {
            const properties = this.getPropertiesBasedOnVersion(
                orderDto.readyPupsVersion,
            );

            newOrder.readyPupsVersion = properties.readyPupsVersion;
            newOrder.capacity = properties.capacity;
            newOrder.power = properties.power;
            newOrder.charger = properties.charger;
            newOrder.isAutoLighter = properties.isAutoLighter;
            newOrder.usbQuantity = properties.usbQuantity;
            newOrder.typecQuantity = properties.typecQuantity;
            newOrder.outletQuantity = properties.outletQuantity;
            newOrder.armor = properties.armor;
            newOrder.price = properties.price;
            newOrder.status = properties.status;
            newOrder.id = properties.id;
        } else {
            newOrder.capacity = orderDto.capacity;
            newOrder.power = orderDto.power;
            newOrder.charger = orderDto.charger;
            newOrder.isAutoLighter = orderDto.isAutoLighter;
            newOrder.usbQuantity = orderDto.usbQuantity;
            newOrder.typecQuantity = orderDto.typecQuantity;
            newOrder.outletQuantity = orderDto.outletQuantity;
            newOrder.armor = orderDto.armor;
            newOrder.price = orderDto.price;
            newOrder.status = orderDto.status;
            newOrder.id = orderDto.id;
        }

        user.orders.push(newOrder);
        await user.save();

        return {
            success: true,
            data: user.orders,
        };
    }

    private getPropertiesBasedOnVersion(version: number): CreateOrderDto {
        const versionProperties: { [key: number]: CreateOrderDto } = {
            1: {
                readyPupsVersion: 1,
                capacity: 50000,
                power: 250,
                charger: 5,
                isAutoLighter: true,
                usbQuantity: 2,
                typecQuantity: 0,
                outletQuantity: 1,
                armor: true,
                price: 6291,
                status: OrderStatus.Placed,
                id: Date.now(),
            },
            1.5: {
                readyPupsVersion: 1.5,
                capacity: 50000,
                power: 250,
                charger: 5,
                isAutoLighter: false,
                usbQuantity: 4,
                typecQuantity: 0,
                outletQuantity: 1,
                armor: true,
                price: 6451,
                status: OrderStatus.Placed,
                id: Date.now(),
            },
            2: {
                readyPupsVersion: 2,
                capacity: 60000,
                power: 250,
                charger: 10,
                isAutoLighter: false,
                usbQuantity: 4,
                typecQuantity: 0,
                outletQuantity: 1,
                armor: true,
                price: 7889,
                status: OrderStatus.Placed,
                id: Date.now(),
            },
        };

        const properties = versionProperties[version];
        if (!properties) {
            throw new Error(`Unsupported readyPupsVersion: ${version}`);
        }

        return properties;
    }

    async getUserOrders(userId: string) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return {
            success: true,
            data: user.orders,
        };
    }

    async deleteUserOrder(userId: string, orderId: number) {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const orderIndex = user.orders.findIndex(
            (order) => order.id === orderId,
        );
        if (orderIndex === -1) {
            throw new NotFoundException(
                `Order with ID ${orderId} not found for user with ID ${userId}`,
            );
        }

        user.orders.splice(orderIndex, 1);

        await user.save();

        return {
            success: true,
            message: `Order with ID ${orderId} deleted successfully for user with ID ${userId}`,
        };
    }
}
