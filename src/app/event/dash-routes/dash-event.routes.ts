import { Routes } from "@angular/router";
import { DashEventPageComponent } from "../pages/dash/dash-event-page/dash-event-page.component";
import { CreateEventPageComponent } from "../pages/dash/create-event-page/create-event-page.component";
import { DashDetailEventPageComponent } from "../pages/dash/dash-detail-event-page/dash-detail-event-page.component";

export const dashEventRoutes: Routes = [
    {
        path: '', 
        component: DashEventPageComponent
    }, 
    {
        path: 'create-event', 
        component: CreateEventPageComponent
    }, 
    {
        path: 'detail-event/:evenId',
        component: DashDetailEventPageComponent
    }
]