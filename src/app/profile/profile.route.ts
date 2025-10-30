import { Routes } from "@angular/router";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { PaymentsPageComponent } from "./pages/payments-page/payments-page.component";
import { HistoryPageComponent } from "./pages/history-page/history-page.component";
import { AddPaymentPage } from "./pages/add-payment-page/add-payment-page";
export const profileRoute: Routes = [
    {
        path: '', 
        component: ProfilePageComponent
    }, 
    {
        path: 'payments',
        component: PaymentsPageComponent
    },
    {
        path: 'history',
        component: HistoryPageComponent
    },
    {
        path: 'add-method', 
        component: AddPaymentPage
    }
];

export default profileRoute;