import { Component, computed, inject } from '@angular/core';
import homeRoutes from '../../home.routes';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'home-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './home-sidebar.component.html',
})
export class HomeSidebarComponent { 
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
  user = computed(() => this.authService.user());
  routes = homeRoutes
    .flatMap((route) =>
      route.children?.map((childRoute) => ({
        path: childRoute.path,
        title: childRoute.title,
        icon: childRoute.data?.['icon'] || 'circle',
      })) || []
    )
    .filter((route) => route.path !== '**' && route.path !== 'profile-user');

}
