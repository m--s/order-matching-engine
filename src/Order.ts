export enum OrderType {
    MARKET = 'MARKET',
    LIMIT = 'LIMIT'
}

export enum OrderSide {
    BUY = 'BUY',
    SELL = 'SELL',
}

export class Order {
    constructor(public type: OrderType, public side: OrderSide, public quantity: number, public price: number = -1, public orderDate = new Date()) {
    }
}
