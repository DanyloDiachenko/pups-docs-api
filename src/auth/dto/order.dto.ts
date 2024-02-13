import { IsBoolean, IsInt, IsNumber, IsOptional } from 'class-validator';

export class UserOrderDto {
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

    @IsOptional()
    @IsNumber()
    @IsInt()
    readyPupsVersion: number | null;
}
