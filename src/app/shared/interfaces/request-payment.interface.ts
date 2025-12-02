export interface RequestPaymentInterface {
    items: Item[];
    eventId: number;
    description: string;
    currency: string;
    paymentMethodTypes: string[]; // ['card']
}

export interface Item {
    type: string; // ticket / product
    itemId: number;
    quantity: number;
    unitPrice: number;
    name: string;
}

