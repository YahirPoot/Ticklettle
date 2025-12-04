import { TicketInterface } from "./ticket.interface";

export interface ResponseTicketInterface{
    items: TicketInterface[],
    totalCount: number,
    page: number,
    pageSize: number,
    totalPages: number
}
