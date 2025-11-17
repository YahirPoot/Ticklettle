import { TypeTicketInterface } from "../../ticket/interfaces";

export interface EventInterface {
    eventId: number;
    name: string;
    description: string;
    dateTime: string;
    location: string;
    type: string;
    status: string;
    imageUrl: string;
    organizingHouseId: number;
    createdAt: string;
    organizingHouse: {
        organizingHouseId: number;
        name: string;
        address: string;
        contact: string;
        taxData: string;
        organizerId: number;
        eventCount: number;
    },
    ticketTypes: TypeTicketInterface[],
    products: ProductInterface[]
}

export interface ProductInterface {
    productId: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    eventId: number;
}