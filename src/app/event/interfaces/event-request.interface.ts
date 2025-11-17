import { TicketTypeRequest } from "../../ticket/interfaces";

export interface CreateEventRequest{
    name: string;
    description: string;
    dateTime: string;
    location: string;
    type: string;
    status: string | 'Activo';
    organizingHouseId: number;
    imageUrl: string;
    ticketTypes: TicketTypeRequest[];
    products: ProductRequest[];
};

export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
}