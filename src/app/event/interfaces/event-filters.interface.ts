export interface EventFilter {
    Page?: number;
    PageSize?: number;
    Search?: string;
    SortBy?: string;
    SortDesc?: boolean;

    // Filter.*
    "Filter.Type"?: string;
    "Filter.Status"?: string;
    "Filter.Ubication"?: string;
    "Filter.StartDate"?: string;      // date-time (ISO string)
    "Filter.EndDate"?: string;        // date-time (ISO string)
    
    // SpecialFilter.*
    "SpecialFilter.IsPopular"?: boolean;
    "SpecialFilter.IsFree"?: boolean;
    "SpecialFilter.IsTicketsSold"?: boolean;
    "SpecialFilter.IsFavorite"?: boolean;
    "SpecialFilter.IsWatched"?: boolean;
    "SpecialFilter.IsUpcoming"?: boolean;
    "SpecialFilter.DateRange"?: string;
}