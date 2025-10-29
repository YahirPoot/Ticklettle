export interface Ticket {
    id: number;
    organizer: string;
    ticketType: string;
    dateAndTime: string;
    location: string;
    icon: string;
    status: string;
    qrPlaceholder: string;
}