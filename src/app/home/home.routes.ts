import { Routes } from "@angular/router";

import { HomeLayoutComponent } from "./layout/home-layout/home-layout.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { FavoritePageComponent } from "./pages/favorite-page/favorite-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { TicketPageComponent } from "./pages/ticket-page/ticket-page.component";

import { eventRoutes } from "../event/event.routes";
import ticketRoutes from "../ticket/ticket.routes";

export const homeRoutes: Routes = [
    {
        path: '',
        component: HomeLayoutComponent,
        children: [
            {
                path: '',
                title: 'Inicio',
                data: { icon: 'home_outline' },
                component: HomePageComponent,
                children: eventRoutes
            }, 
            {
                path: 'tickets', 
                title: 'Boletos',
                data: { icon: 'confirmation_number' },
                component: TicketPageComponent,
                children: ticketRoutes
            },
            { 
                path: 'favorites', 
                title: 'Favoritos',
                data: { icon: 'favorite' },
                component: FavoritePageComponent 
            },
            { 
                path: 'profile-user', 
                title: 'Perfil',
                data: { icon: 'person' },
                component: ProfilePageComponent 
            },

            {
                path: '**',
                redirectTo: ''
            }

        ]
    }
]

export default homeRoutes;