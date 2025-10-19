import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";
import { RegisterPageComponent } from "./pages/register-page/register-page.component";
import { GoogleAuthCallbackComponent } from "./components/google-auth-callback/google-auth-callback.component";
import { SelectRolComponent } from "./components/select-rol/select-rol.component";

export const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'login', 
                component: LoginPageComponent,
            },
            {
                path: 'register',
                component: RegisterPageComponent,
            },
            
            {
                path: 'callback', 
                component: GoogleAuthCallbackComponent,
            },
            {
                path: 'select-rol',
                component: SelectRolComponent
            },
            {
                path: '**',
                redirectTo: 'login',
            }, 
        ] 
    },
];

export default authRoutes;