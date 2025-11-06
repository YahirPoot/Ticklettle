export interface OrderRequest {
    eventId: number;
    items: OrderItem[];
    buyer: {
        userId: string | number | undefined;
        email: string | undefined;
        nameUser: string | undefined;
    };
    total: number;
    totalTickets: number;
}

export interface OrderItem {
    title: string;
    unitPrice: number;
    unit_amount: number;
    quantity: number;
}
