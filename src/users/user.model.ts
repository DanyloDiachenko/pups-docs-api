import { prop, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps, Base } from '@typegoose/typegoose/lib/defaultClasses';

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
