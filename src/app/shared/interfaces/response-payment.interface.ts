export interface ResponsePaymentInterface {
    saleId: number,
    attendeeId: number,
    orderNumber: string,
    paymentMethod: string,
    buyerName: string,
    totalAmount: number,
    status: string,
    createdAt: string   ,
    items: ResponseItemPaymentInterface[],
    payment: PaymentIntentResponse
}

export interface ResponseItemPaymentInterface {
    itemName: string,
    unitPrice: number,
    quantity: number,
    totalPrice: number,
    type: string
}

export interface PaymentIntentResponse {
    paymentId: number;
    paymentIntentId: string;
    status: string,
    amount: number,
    createdAt: string
}