import { ProductRequest } from "../../product/interfaces";
import { TicketTypeRequest } from "../../ticket/interfaces";

export interface CreateEventRequest{
    name: string;
    description: string;
    dateTime: string;
    location: string;
    city: string;
    state: string;
    postalCode: string;
    ubication: string;
    tags: string[];
    type: string;
    status: string | 'Activo';
    organizingHouseId: number;
    imageUrl: string;
    ticketTypes: TicketTypeRequest[];
    products: ProductRequest[];
};
