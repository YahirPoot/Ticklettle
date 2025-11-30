import { ProductInterface } from "./product.interface"

export interface ProductResponse{
    items: ProductInterface[],
    totalCount: number,
    page: number,
    pageSize: number,
    totalPages: number
}