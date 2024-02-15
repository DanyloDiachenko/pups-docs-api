import { prop, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps, Base } from '@typegoose/typegoose/lib/defaultClasses';
import { OrderStatus } from './dto/order.dto';

class Order {
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
    id?: string;
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
