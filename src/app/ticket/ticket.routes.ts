import { Routes } from "@angular/router";
import { TicketPage } from "./pages/ticket-page/ticket-page";
import { DetailTicketPage } from "./pages/ticket-page/detail-ticket-page/detail-ticket-page";

export const ticketRoutes: Routes= [
    {
        path: '',
        component: TicketPage
    },
    { 
        path: 'detail-ticket/:ticketId', 
        component: DetailTicketPage
    },
]
export default ticketRoutes;