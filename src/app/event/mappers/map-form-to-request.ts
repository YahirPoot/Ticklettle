import { TicketTypeRequest } from "../../ticket/interfaces";
import { CreateEventFormValue, CreateEventRequest, ProductRequest } from "../interfaces";


export function mapFormToCreateEventRequest(
    formValue: CreateEventFormValue,
    eventImageUrl: string,
    productsImageUrls: string[],
    organizingHouseId: number
): CreateEventRequest {
    // Mapeo de fecha y hora a formato ISO
    const dateTime = new Date(`${formValue.date}T${formValue.time}`).toISOString();
    const isFree = (formValue.type ?? '').toString() === 'Gratis';

    const ticketTypes: TicketTypeRequest[] = (formValue.tickets || []).map(t => ({
        name: t.type || 'General',
        description: '',
        price: isFree ? 0 : t.ticketPrice,
        availableQuantity: t.quantity,
    } as TicketTypeRequest ));
    
    const products: ProductRequest[] = (formValue.products || []).map((p, index) => ({
        name: p.name,
        description: p.description || '',
        price: p.productPrice,
        stock: p.stock,
        imageUrl: productsImageUrls[index] ?? p.imageUrl ?? ''
    }));

    return {
        name: formValue.name,
        description: formValue.description,
        dateTime,
        location: formValue.location,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        tags: formValue.tags || [],
        type: formValue.type,
        status: 'Activo',
        organizingHouseId,
        imageUrl: eventImageUrl,
        ticketTypes,
        products,
    } as CreateEventRequest;
}