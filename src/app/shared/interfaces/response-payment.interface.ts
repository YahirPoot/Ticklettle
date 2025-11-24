export interface ResponsePaymentInterface {
    saleId: number,
    attendeeId: number,
    orderNumber: string,
    totalAmount: number,
    status: string,
    createdAt: string   ,
    items: ResponseItemPaymentInterface[],
    payment: {
        paymentIntentId: "pi_3SWsRoEP3aJhyM2V0U9mYy23",
        status: "succeeded",
        amount: 1000,
        createdAt: "2025-11-24T05:36:24.9029011"
    }
}

export interface ResponseItemPaymentInterface {
    itemName: string,
    unitPrice: number,
    quantity: number,
    totalPrice: number,
    type: string
}

export interface PaymentIntentResponse {
    paymentIntentId: string;
    status: string,
    amount: number,
    createdAt: string
}