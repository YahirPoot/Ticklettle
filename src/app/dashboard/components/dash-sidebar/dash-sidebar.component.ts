import { Component, computed, inject } from '@angular/core';
import dashRoutes from '../../dash.routes';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'dash-sidebar',
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './dash-sidebar.component.html',
})
export class DashSidebarComponent { 
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
  
  routes = dashRoutes
      .flatMap((route) =>
        route.children?.map((childRoute) => ({
          path: childRoute.path,
          title: childRoute.title,
          icon: childRoute.data?.['icon'] || 'circle',
        })) || []
      )
      .filter((route) => route.path !== '**');
}
