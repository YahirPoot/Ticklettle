import { Routes } from "@angular/router";
import { BuyTicketPageComponent } from "./pages/buy-ticket-page/buy-ticket-page.component";
import { DetailTicketPageComponent } from "./pages/detail-ticket-page/detail-ticket-page.component";
import { TicketPageComponent } from "./pages/ticket-page/ticket-page.component";
import { CheckoutComponent } from "../shared/components/checkout/checkout.component";
import { PaymentSuccessComponent } from "../shared/components/payment-success/payment-success.component";

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
    },
    {
        path: 'checkout',
        component: CheckoutComponent
    },
    {
        path: 'success-payment',
        component: PaymentSuccessComponent
    }
]
export default ticketRoutes;    