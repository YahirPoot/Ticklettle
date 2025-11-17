import { EventInterface } from "./event.interface";

export interface EventsResponse{
  items: EventInterface[],
  totalCount: 6,
  page: 1,
  pageSize: 10,
  totalPages: 1
}