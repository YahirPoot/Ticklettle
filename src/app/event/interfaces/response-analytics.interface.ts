
export interface ResponseAnalitycsInterface {
    kpis: Kpis,
    ticketsByMonth: TicketsByMonth[],
    productsByMonth: ProductsByMonth[],
    topEventsByTickets: TopEventByTickets[],
    topProducts: TopProduct[],
    recentSales: RecentSale[],
    availableTags: string[]
}

export interface Kpis {
    eventsCount: number;
    activeEventsCount: number;
    ticketTypesCount: number;
    ticketsSoldTotal: number;
    productsCount: number;
    productsSoldTotal: number;
    estimatedRevenue: number;
}

export interface TicketsByMonth {
    year: number;
    month: number;
    value: number;
}

export interface ProductsByMonth {
    year: number;
    month: number;
    value: number;
}

export interface TopEventByTickets {
    eventId: number;
    name: string;
    ticketsSold: number;
    ticketTypesCount: number;
    imageUrl: string;
}

export interface TopProduct {
    productId: number;
    name: string;
    unitsSold: number;
    imageUrl: string;
    price: number;
    eventName: string;
}

export interface RecentSale {
    saleId: number,
    eventId: number,
    eventName: string,
    ticketTypeName: string,
    buyerName: string,
    date: string,
    amount: number
}   

