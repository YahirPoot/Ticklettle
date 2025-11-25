    export interface CreateEventFormValue {
    name: string;
    description?: string;
    date: string;    // yyyy-mm-dd
    time: string;    // HH:mm
    location?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    tags?: string[];
    type: 'Gratis' | 'Pago' | string;
    capacity?: number | null;
    sellMerch?: boolean;
    tickets: Array<{
        type: string;
        ticketPrice: number;
        quantity: number;
    }>;
    products: Array<{
        name: string;
        description?: string;
        productPrice: number;
        stock: number;
        imageUrl?: string;
    }>;
    postEventContent?: boolean;
}