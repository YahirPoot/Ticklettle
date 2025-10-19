import { Routes } from '@angular/router';
import { hasRoleGuard } from './auth/guards/has-role.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
    },
    {
        path: 'admin', 
        loadChildren: () => import('./dashboard/dash.routes'),
        canMatch: [
            hasRoleGuard('organizador'),
        ]
    },
    {
        path: '',
        loadChildren: () => import('./home/home.routes'),
    },
]; 