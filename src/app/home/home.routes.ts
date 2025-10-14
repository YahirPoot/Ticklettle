import { Routes } from "@angular/router";
import { HomeLayoutComponent } from "./layout/home-layout/home-layout.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { TicketPageComponent } from "./pages/ticket-page/ticket-page.component";
import { FavoritePageComponent } from "./pages/favorite-page/favorite-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";

export const homeRoutes: Routes = [
    {
        path: '',
        component: HomeLayoutComponent,
        children: [
            {
                path: '',
                component: HomePageComponent,
            }, 
            { path: 'tickets', component: TicketPageComponent },
            { path: 'favorites', component: FavoritePageComponent },
            { path: 'profile-user', component: ProfilePageComponent },

            {
                path: '**',
                redirectTo: ''
            }

        ]
    }
]

export default homeRoutes;