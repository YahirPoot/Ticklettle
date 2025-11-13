import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashSidebarComponent } from '../../components/dash-sidebar/dash-sidebar.component';
import { CustomerNotificationComponent } from '../../../shared/components/customer-notification/customer-notification.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, DashSidebarComponent, CustomerNotificationComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent { }
