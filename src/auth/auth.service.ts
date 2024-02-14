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

    async updateUserOrders(userId: string, orderDto: UserOrderDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        this.setOrderPropertiesBasedOnVersion(orderDto);

        user.orders.push(orderDto);

        await user.save();

        return {
            success: true,
            data: user.orders,
        };
    }

    private setOrderPropertiesBasedOnVersion(orderDto: UserOrderDto) {
        const properties = this.getPropertiesBasedOnVersion(
            orderDto.readyPupsVersion,
        );

        orderDto.readyPupsVersion = properties.readyPupsVersion;
        orderDto.capacity = properties.capacity;
        orderDto.power = properties.power;
        orderDto.charger = properties.charger;
        orderDto.isAutoLighter = properties.isAutoLighter;
        orderDto.usbQuantity = properties.usbQuantity;
        orderDto.typecQuantity = properties.typecQuantity;
        orderDto.outletQuantity = properties.outletQuantity;
        orderDto.armor = properties.armor;
        orderDto.price = properties.price;
    }

    private getPropertiesBasedOnVersion(version: number): UserOrderDto {
        const versionProperties: { [key: number]: UserOrderDto } = {
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
}
