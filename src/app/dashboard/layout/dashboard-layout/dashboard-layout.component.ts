import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashSidebarComponent } from '../../components/dash-sidebar/dash-sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, DashSidebarComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent { }
