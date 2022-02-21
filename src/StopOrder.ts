import {Order} from "./Order";

export enum StopOrderCondition {
    LESS_THAN = 'LESS_THAN',
    MORE_THAN = 'MORE_THAN',
}

export class StopOrder {
    constructor(public order: Order, public price: number, public condition: StopOrderCondition) {
    }
}
