import { Routes } from "@angular/router";
import { BuyTicketPageComponent } from "./pages/buy-ticket-page/buy-ticket-page.component";
import { DetailTicketPageComponent } from "./pages/detail-ticket-page/detail-ticket-page.component";
import { TicketPageComponent } from "./pages/ticket-page/ticket-page.component";

export const ticketRoutes: Routes= [
    {
        path: '',
        component: TicketPageComponent
    },
    { 
        path: 'detail-ticket/:ticketId', 
        component: DetailTicketPageComponent
    },
    {
        path: 'buy-ticket/:eventId',
        component: BuyTicketPageComponent
    }
]
export default ticketRoutes;