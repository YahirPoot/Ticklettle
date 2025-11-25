
export interface ProductInterface{
    productId: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    eventId: number;
    soldQuantity?: number;
    imageUrl: string;
}
