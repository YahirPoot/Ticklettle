import { Routes } from '@angular/router';
import { hasRoleGuard } from './auth/guards/has-role.guard';
import { noAuthenticatedGuard } from './auth/guards/no-authenticated.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
        canMatch: [
            noAuthenticatedGuard,
        ]
    },
    {
        path: 'admin', 
        loadChildren: () => import('./dashboard/dash.routes'),
        canMatch: [
            hasRoleGuard(1),
        ]
    },
    {
        path: '',
        loadChildren: () => import('./home/home.routes'),
    },
]; 