import { TicketTypeRequest } from "../../ticket/interfaces";

export interface EventCreateRequest {
    title: string;
    description: string;
    location: string;
    date?: string;
    time?: string;
    capacity?: number | null;
    tickets: TicketTypeRequest[];
    sellMerch: boolean;
    postEventContent: boolean;
    image?: string | File | null;
    organizerId?: string | number;
    tags?: string[];
}