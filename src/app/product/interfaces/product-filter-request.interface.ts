export interface ProductFilterRequest{
    page?: number,
    pageSize?: number,
    search?: string,
    sortBy?: string,
    sortDesc?: boolean,
    filter?: ProductFilter,
    specialFilter?: ProductSpecialFilter
}

export interface ProductFilter {
    eventId?: number[],
    name?: string,
    description?: string,
    minPrice?: number,
    maxPrice?: number
}

export interface ProductSpecialFilter {
    isPopular?: boolean,
    isFree?: boolean,
    isWatched?: boolean
}