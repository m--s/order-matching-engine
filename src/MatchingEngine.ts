import {OrderBook} from "./OrderBook";
import {StopOrder, StopOrderCondition} from "./StopOrder";
import {Order, OrderSide, OrderType} from "./Order";
import {Trade} from "./Trade";

export class MatchingEngine {
    orderBook = new OrderBook();
    trades: Trade[] = [];
    stopOrders: StopOrder[] = [];

    public match(order: Order) {
        if (order.type === OrderType.LIMIT) {
            if (order.side === OrderSide.BUY && order.price >= this.orderBook.getBestAsk()) {
                return this.processOrder(order);
            } else if (order.side === OrderSide.SELL && order.price <= this.orderBook.getBestBid()) {
                return this.processOrder(order);
            } else {
                this.orderBook.add(order);
            }
        } else {
            return this.processOrder(order);
        }
    }

    public addStopOrder(stopOrder: StopOrder) {
        if (!this.processStopOrder(stopOrder)) {
            this.stopOrders.push(stopOrder);
        }
    }

    private processOrder(order: Order) {
        let filled = 0;

        const orderSource = order.side === OrderSide.BUY ? this.orderBook.asks : this.orderBook.bids;

        let lastPrice = -1;
        for (const orderBookItem of orderSource) {
            if (order.type === OrderType.LIMIT) {
                if (order.side === OrderSide.BUY && orderBookItem.price > order.price) {
                    break;
                } else if (order.side === OrderSide.SELL && orderBookItem.price < order.price) {
                    break;
                }
            }
            if (filled === order.quantity) {
                break;
            } else if (filled + orderBookItem.quantity <= order.quantity) {
                filled += orderBookItem.quantity
                this.orderBook.remove(orderBookItem);
                this.trades.push(new Trade(orderBookItem.price, orderBookItem.quantity));
            } else if (filled + orderBookItem.quantity > order.quantity) {
                const volume = order.quantity - filled;
                filled += volume;
                this.trades.push(new Trade(orderBookItem.price, volume));
                orderBookItem.quantity -= volume;
            }
            lastPrice = orderBookItem.price;
        }

        if (filled < order.quantity) {
            const price = order.price === -1 ? lastPrice : order.price;
            this.orderBook.add(new Order(OrderType.LIMIT, order.side, order.quantity - filled, price));
        }
        this.processStopOrders();
    }

    private processStopOrders() {
        for (const stopOrder of this.stopOrders) {
            this.processStopOrder(stopOrder);
        }
    }

    private processStopOrder(stopOrder: StopOrder): boolean {
        const currentPrice = stopOrder.order.side === OrderSide.BUY ? this.orderBook.getBestAsk() : this.orderBook.getBestBid();

        const conditionsMet = isFinite(currentPrice) && ((stopOrder.condition === StopOrderCondition.LESS_THAN && currentPrice < stopOrder.price)
            || (stopOrder.condition === StopOrderCondition.MORE_THAN && currentPrice > stopOrder.price));

        if (conditionsMet) {
            this.removeStopOrder(stopOrder);
            this.match(stopOrder.order);
            return true;
        }
        return false;
    }

    private removeStopOrder(stopOrder: StopOrder) {
        this.stopOrders = this.stopOrders.filter(so => so !== stopOrder);
    }
}
