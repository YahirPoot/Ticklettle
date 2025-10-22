import { Routes } from "@angular/router";
import { DetailEventComponent } from "./pages/detail-event/detail-event.component";
import { EventPageComponent } from "./pages/event-page/event-page.component";

export const eventRoutes: Routes = [
    {
        path: '', 
        component: EventPageComponent,
    },
    {
        path: 'detail-event/:eventId', 
        component: DetailEventComponent,
    },
]