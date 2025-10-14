import { Component } from '@angular/core';
import homeRoutes from '../../home.routes';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'home-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './home-sidebar.component.html',
})
export class HomeSidebarComponent { 
  routes = homeRoutes
    .flatMap((route) =>
      route.children?.map((childRoute) => ({
        path: childRoute.path,
        title: childRoute.title,
        icon: childRoute.data?.['icon'] || 'circle',
      })) || []
    )
    .filter((route) => route.path !== '**');
}
