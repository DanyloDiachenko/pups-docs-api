import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
} from 'class-validator';

export enum OrderStatus {
    Placed = 'placed',
    MaterialsPurchased = 'purchasingMaterials',
    InProduction = 'manufacturing',
    InDelivery = 'delivering',
    Completed = 'completed',
}

export class UserOrderDto {
    constructor() {
        this.createdAt = new Date();
    }

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

    createdAt?: Date;
}
