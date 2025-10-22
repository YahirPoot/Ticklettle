import { Routes } from "@angular/router";
import { DashboardLayoutComponent } from "./layout/dashboard-layout/dashboard-layout.component";
import { DashHomePageComponent } from "./pages/dash-home-page/dash-home-page.component";

export const dashRoutes: Routes = [
    {
        path: '', 
        component: DashboardLayoutComponent, 
        children: [
            {
                path: 'dashboard', 
                component: DashHomePageComponent,
            },
            {
                path: '**',
                redirectTo: 'dashboard',
            }
        ]
    }, 
]

export default dashRoutes;