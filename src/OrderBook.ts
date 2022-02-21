import {Order, OrderSide} from "./Order";

export class OrderBook {
    asks: Order[] = [];
    bids: Order[] = [];

    public add(order: Order) {
        if (order.side === OrderSide.BUY) {
            const bidsNumber = this.bids.length;
            let i = 0;
            if (bidsNumber) {
                for (i = 0; i < bidsNumber; i++) {
                    const buyOrder = this.bids[i];
                    if (buyOrder.price < order.price) {
                        break;
                    }
                }
            }
            this.bids.splice(i, 0, order);
        } else if (order.side === OrderSide.SELL) {
            const asksNumber = this.asks.length;
            let i = 0;
            if (asksNumber) {
                if (asksNumber) {
                    for (i = 0; i < asksNumber; i++) {
                        const sellOrder = this.asks[i];
                        if (sellOrder.price > order.price) {
                            break;
                        }
                    }
                }
            }
            this.asks.splice(i, 0, order)
        }
    }

    public getBestBid() {
        return this.bids.length ? this.bids[0].price : Number.POSITIVE_INFINITY;
    }

    public getBestAsk() {
        return this.asks.length ? this.asks[0].price : Number.NEGATIVE_INFINITY;
    }

    public remove(order: Order) {
        if (order.side === OrderSide.BUY) {
            this.bids = this.bids.filter(bid => bid !== order);
        } else if (order.side === OrderSide.SELL) {
            this.asks = this.asks.filter(ask => ask !== order);
        }
    }
}
