## Simple order matching engine
Basic implementation of the order book and order matching engine done in TypeScript.

Features:
* market orders
* limit orders
* market/limit stop orders when price is higher/lower than condition

```typescript
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
```
