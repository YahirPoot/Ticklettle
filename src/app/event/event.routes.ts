import { Routes } from "@angular/router";
import { DetailEventComponent } from "./pages/detail-event/detail-event.component";
import { EventPageComponent } from "./pages/event-page/event-page.component";
import { PopularEventPageComponent } from "./pages/popular-event-page/popular-event-page.component";
import { NextEventPageComponent } from "./pages/next-event-page/next-event-page.component";

export const eventRoutes: Routes = [
    {
        path: '', 
        component: EventPageComponent,
    },
    {
        path: 'detail-event/:eventId', 
        component: DetailEventComponent,
    },
    {
        path: 'event/popular-events',
        component: PopularEventPageComponent
    },
    {
        path: 'event/next-events',
        component: NextEventPageComponent
    }
]