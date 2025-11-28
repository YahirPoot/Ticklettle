import { EventInterface } from "./event.interface";

export interface EventsResponse{
  items: EventInterface[],
  totalCount: number,
  page: number,
  pageSize: number,
  totalPages: number
}