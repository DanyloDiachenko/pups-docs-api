import { IsBoolean, IsInt, IsNumber, IsOptional } from 'class-validator';

export class UserOrderDto {
    @IsNumber()
    capacity: number;

    @IsOptional()
    @IsNumber()
    power: number;

    @IsOptional()
    @IsNumber()
    charger: number;

    @IsOptional()
    @IsBoolean()
    isAutoLighter: boolean;

    @IsOptional()
    @IsInt()
    usbQuantity: number;

    @IsOptional()
    @IsInt()
    typecQuantity: number;

    @IsOptional()
    @IsInt()
    outletQuantity: number;

    @IsOptional()
    @IsBoolean()
    armor: boolean;

    @IsOptional()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    @IsInt()
    readyPupsVersion: number | null;
}
