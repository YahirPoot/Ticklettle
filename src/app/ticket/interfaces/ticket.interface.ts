export interface Ticket {
    id: number;
    organizer: string;
    ticketType: string;
    dateAndTime: string;
    location: string;
    icon: string;
    status: string;
    method_payment: string,
    qrPlaceholder: string;
    buyer: Buyer,
    parchaseDate: string;
}

export interface Buyer {
    name: string;
    id: string | number;
    correo: string;
}
