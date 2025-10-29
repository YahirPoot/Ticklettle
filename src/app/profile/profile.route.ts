import { Routes } from "@angular/router";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { PaymentsPageComponent } from "./pages/payments-page/payments-page.component";
import { HistoryPageComponent } from "./pages/history-page/history-page.component";

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
    }
];

export default profileRoute;