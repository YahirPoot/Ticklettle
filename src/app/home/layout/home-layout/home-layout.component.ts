import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeSidebarComponent } from '../../components/home-sidebar/home-sidebar.component';
import { CustomNotification } from '../../../shared/components/custom-notification/custom-notification';

@Component({
  selector: 'home-layout',
  imports: [RouterOutlet, HomeSidebarComponent, CustomNotification],
  templateUrl: './home-layout.component.html',
})
export class HomeLayoutComponent { 
   closeDrawer() {
      const el = document.getElementById('my-drawer-4') as HTMLInputElement | null;
      if (el) el.checked = false;
    }
}
