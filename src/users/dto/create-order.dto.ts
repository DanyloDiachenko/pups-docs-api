import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
} from 'class-validator';
import { OrderStatus } from './orderStatus';

export class CreateOrderDto extends TimeStamps {
    @IsNumber()
    capacity: number;

    @IsNumber()
    power: number;

    @IsNumber()
    charger: number;

    @IsBoolean()
    isAutoLighter: boolean;

    @IsInt()
    usbQuantity: number;

    @IsInt()
    typecQuantity: number;

    @IsInt()
    outletQuantity: number;

    @IsBoolean()
    armor: boolean;

    @IsNumber()
    price: number;

    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsNumber()
    @IsOptional()
    readyPupsVersion: number;

    @IsNumber()
    id: number;
}
