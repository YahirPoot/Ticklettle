export interface TicketTypeRequest {
    name: string; // Seria el tipo de boleto (General, VIP, etc.)
    description: string;
    price: number;
    availableQuantity: number;
}