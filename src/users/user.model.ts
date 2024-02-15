import { prop } from '@typegoose/typegoose';
import { TimeStamps, Base } from '@typegoose/typegoose/lib/defaultClasses';
import { OrderStatus } from './dto/orderStatus';
import { ObjectId } from 'mongoose';

export class Order extends TimeStamps {
    @prop()
    capacity: number;

    @prop()
    power: number;

    @prop()
    charger: number;

    @prop()
    isAutoLighter: boolean;

    @prop()
    usbQuantity: number;

    @prop()
    typecQuantity: number;

    @prop()
    outletQuantity: number;

    @prop()
    armor: boolean;

    @prop()
    readyPupsVersion: number | null;

    @prop()
    status: OrderStatus;

    @prop()
    createdAt?: Date;

    @prop()
    price: number;

    @prop()
    _id: ObjectId;

    @prop()
    id: number;
}

export interface UserModel extends Base {}
export class UserModel extends TimeStamps {
    @prop({ unique: true })
    email: string;

    @prop()
    passwordHash: string;

    @prop({ type: () => [Order] })
    orders: Order[];
}
