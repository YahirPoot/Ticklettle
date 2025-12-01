import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER, inject, LOCALE_ID } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';


import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment.dev';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
// import { UserRepositoryService } from './auth/services/user-repository.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);



const googleClientId = environment.googleClientId;

const socialConfigValue: SocialAuthServiceConfig = {
  autoLogin: false,
  providers: [
    // { provide: LOCALE_ID, useValue: 'es-MEX' },
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(
        googleClientId,
        { scopes: 'profile email',}
      )
    }
  ],
  onError: (err: any) => console.error(err)
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor
      ])
    ),
    importProvidersFrom(SocialLoginModule),
    { provide: 'SocialAuthServiceConfig', useValue: socialConfigValue }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), 
    { provide: LOCALE_ID, useValue: 'es-MX' },
      // {
      //   provide: APP_INITIALIZER,
      //   multi: true,
      //   useFactory: () => {
      //     const seeder = inject(UserRepositoryService);
      //     return () => seeder.seed();
      //   }
      // }
  ]
};
