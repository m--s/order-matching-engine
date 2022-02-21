import {OrderBook} from "./OrderBook";
import {Order, OrderSide, OrderType} from "./Order";

describe('OrderBook', () => {
    it('adds first buy order', () => {
        const orderBook = new OrderBook();

        const order1 = new Order(OrderType.MARKET, OrderSide.BUY, 10, 1);
        orderBook.add(order1);

        expect(orderBook.bids.length).toBe(1);
    });

    it('adds few buy orders in right order', () => {
        const orderBook = new OrderBook();

        const order1 = new Order(OrderType.MARKET, OrderSide.BUY, 1, 10);
        const order2 = new Order(OrderType.MARKET, OrderSide.BUY, 1, 11);
        const order3 = new Order(OrderType.MARKET, OrderSide.BUY, 1, 9);
        const order4 = new Order(OrderType.MARKET, OrderSide.BUY, 1, 14);

        orderBook.add(order1);
        orderBook.add(order2);
        orderBook.add(order3);
        orderBook.add(order4);

        expect(orderBook.bids.length).toBe(4);
        expect(orderBook.bids[1].price).toBeLessThanOrEqual(orderBook.bids[0].price);
        expect(orderBook.bids[2].price).toBeLessThanOrEqual(orderBook.bids[1].price);
        expect(orderBook.bids[3].price).toBeLessThanOrEqual(orderBook.bids[2].price);

        expect(orderBook.getBestBid()).toBe(14);
    });

    it('adds few sell orders in right order', () => {
        const orderBook = new OrderBook();

        const order1 = new Order(OrderType.MARKET, OrderSide.SELL, 1, 7);
        const order2 = new Order(OrderType.MARKET, OrderSide.SELL, 1, 12);
        const order3 = new Order(OrderType.MARKET, OrderSide.SELL, 1, 13);
        const order4 = new Order(OrderType.MARKET, OrderSide.SELL, 1, 8);

        orderBook.add(order1);
        orderBook.add(order2);
        orderBook.add(order3);
        orderBook.add(order4);

        expect(orderBook.asks[0].price).toBeLessThanOrEqual(orderBook.asks[1].price)
        expect(orderBook.asks[1].price).toBeLessThanOrEqual(orderBook.asks[2].price)
        expect(orderBook.asks[2].price).toBeLessThanOrEqual(orderBook.asks[3].price)

        expect(orderBook.getBestAsk()).toBe(7);
    });

});