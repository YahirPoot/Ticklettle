import { OrderItem } from "./order-request.interface";

export interface OrderResponse {
    id: string;
    status?: 'pending' | 'completed' | 'failed';
    total?: number;
    createdAt?: string;
    items?: OrderItem[];
}   