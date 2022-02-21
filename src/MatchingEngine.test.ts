import {MatchingEngine} from "./MatchingEngine";
import {Order, OrderSide, OrderType} from "./Order";
import {StopOrder, StopOrderCondition} from "./StopOrder";

describe('MatchingEngine', () => {
    let matchingEngine: MatchingEngine;
    beforeEach(() => {
        matchingEngine = new MatchingEngine();
    });

    describe('type=LIMIT', () => {
        it('scenario 1, take single item', () => {
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 1, 7));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 1, 6));
            expect(matchingEngine.orderBook.getBestAsk()).toBe(6);

            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 1, 6));
            expect(matchingEngine.orderBook.getBestAsk()).toBe(7);
        });

        it('scenario 2, take whole item and another partially', () => {
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 10, 7));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 2, 6));

            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 6, 7));
            expect(matchingEngine.orderBook.getBestAsk()).toBe(7);
            expect(matchingEngine.orderBook.asks[0].quantity).toBe(6);
        });

        it('scenario 3, take whats available and place order for not filled', () => {
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 10, 7));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 2, 6));

            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 15, 7));
            expect(matchingEngine.orderBook.asks.length).toBe(0);
            expect(matchingEngine.orderBook.bids.length).toBe(1);
            expect(matchingEngine.orderBook.bids[0].quantity).toBe(3);
        });
    });

    describe('type=MARKET', () => {
        it('fills market order', () => {
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 10, 7));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 2, 6));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 1, 5));

            matchingEngine.match(new Order(OrderType.MARKET, OrderSide.BUY, 5));
            expect(matchingEngine.orderBook.bids.length).toBe(0);
            expect(matchingEngine.trades.length).toBe(3);
            expect(matchingEngine.orderBook.asks[0].quantity).toBe(8);
        });

        it('fills whole order book and creates limit order with last price', () => {
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 10, 7));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 2, 6));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.SELL, 1, 5));

            matchingEngine.match(new Order(OrderType.MARKET, OrderSide.BUY, 14));
            expect(matchingEngine.orderBook.asks.length).toBe(0);
            expect(matchingEngine.orderBook.bids.length).toBe(1);
            expect(matchingEngine.orderBook.getBestBid()).toBe(7);
            expect(matchingEngine.orderBook.bids[0].quantity).toBe(1);
        });
    });

    describe('stop orders', () => {
        it('take profit', () => {
            expect(matchingEngine.stopOrders.length).toBe(0);
            matchingEngine.addStopOrder(new StopOrder(new Order(OrderType.LIMIT, OrderSide.SELL, 2, 7), 6, StopOrderCondition.MORE_THAN));
            expect(matchingEngine.stopOrders.length).toBe(1);

            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 10, 6));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 5, 7));

            expect(matchingEngine.stopOrders.length).toBe(0);
            expect(matchingEngine.orderBook.bids[0].quantity).toBe(3);
        });

        it('stop loss', () => {
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 10, 4));
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 10, 6));

            // place order & add stop loss
            expect(matchingEngine.stopOrders.length).toBe(0);
            matchingEngine.match(new Order(OrderType.LIMIT, OrderSide.BUY, 5, 6));
            matchingEngine.addStopOrder(new StopOrder(new Order(OrderType.MARKET, OrderSide.SELL, 5), 5, StopOrderCondition.LESS_THAN));
            expect(matchingEngine.stopOrders.length).toBe(1);

            // wild seller appears
            matchingEngine.match(new Order(OrderType.MARKET, OrderSide.SELL, 16));

            expect(matchingEngine.stopOrders.length).toBe(0);
            expect(matchingEngine.orderBook.bids[0].quantity).toBe(4);
        });
    });
});
