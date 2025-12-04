export interface TicketTypeRequest {
    ticketTypeId?: number;
    name: string;
    description?: string;
    price: number;
    availableQuantity: number;
}

export interface ProductRequest {
    productId?: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
}

export interface UpdateEventRequest {
    eventId?: number;
    name: string;
    description: string;
    dateTime: string; // ISO 8601 format
    location: string;
    city?: string;
    state?: string;
    postalCode?: string;
    type: string;
    ubication?: string;
    status: string;
    organizingHouseId?: number;
    imageUrl?: string; // URL to the event image
    tags?: string[];
    ticketTypes?: TicketTypeRequest[];
    products?: ProductRequest[];
}
