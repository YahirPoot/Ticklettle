import { ProductInterface } from "../../product/interfaces/product.interface";


export interface AnalyticsForEventInterface {
    event: EventDetails;
    tickets: TicketDetail[];
    products: ProductInterface[];
    summary: {
        totalTicketsSold: number,
        totalRevenue: number,
        totalProductsSold: number,
        averageRemainingStock: number
    }
}

export interface EventDetails {
    eventId: number;
    name: string;
    dateTime: string;
    location: string;
    city: string;
    state: string;
    imageUrl: string;
}

export interface TicketDetail {
    ticketId: number;
    buyerName: string;
    buyerEmail: string;
    paymentMethod: string;
    purchaseDate: string;
    status: string;
    price: number;
    uniqueCode: string;
    ticketType: string;
}