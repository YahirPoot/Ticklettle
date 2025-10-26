import { Component } from '@angular/core';
import dashRoutes from '../../dash.routes';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'dash-sidebar',
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './dash-sidebar.component.html',
})
export class DashSidebarComponent { 
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
