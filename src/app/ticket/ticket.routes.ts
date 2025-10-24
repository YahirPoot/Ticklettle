import { Routes } from "@angular/router";
import { TicketPage } from "./pages/ticket-page/ticket-page";
import { DetailTicketPage } from "./pages/detail-ticket-page/detail-ticket-page";
import { BuyTicketPage } from "./pages/buy-ticket-page/buy-ticket-page";

export const ticketRoutes: Routes= [
    {
        path: '',
        component: TicketPage
    },
    { 
        path: 'detail-ticket/:ticketId', 
        component: DetailTicketPage
    },
    {
        path: 'buy-ticket/:eventId',
        component: BuyTicketPage
    }
]
export default ticketRoutes;