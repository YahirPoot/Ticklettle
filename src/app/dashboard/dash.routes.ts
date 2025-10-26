import { Routes } from "@angular/router";
import { DashboardLayoutComponent } from "./layout/dashboard-layout/dashboard-layout.component";
import { DashHomePageComponent } from "./pages/dash-home-page/dash-home-page.component";
import { ProfilePageComponent } from "../home/pages/profile-page/profile-page.component";
import { DashEventPageComponent } from "./pages/dash-event-page/dash-event-page.component";
import { DashSalePageComponent } from "./pages/dash-sale-page/dash-sale-page.component";
import { NotFoundPageComponent } from "../shared/components/not-found-page/not-found-page.component";

export const dashRoutes: Routes = [
    {
        path: '', 
        component: DashboardLayoutComponent, 
        children: [
            {
                path: 'dashboard', 
                title: 'Dashboard',
                data: { icon: 'dashboard' },
                component: DashHomePageComponent,
            },
            {
                path: 'event',
                title: 'Eventos',
                data: { icon: 'event' },
                component: DashEventPageComponent,
            },
            {
                path: 'sales', 
                title: 'Ventas',
                data: { icon: 'sell' },
                component: DashSalePageComponent
            },
            {
                path: 'profile', 
                title: 'Perfil',
                data: { icon: 'person' },
                component: ProfilePageComponent
            },
            {
                path: '**',
                component: NotFoundPageComponent,
            }
        ]
    }, 
]

export default dashRoutes;