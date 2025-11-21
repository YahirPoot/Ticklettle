import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerNotificationComponent } from '../../../shared/components/customer-notification/customer-notification.component';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, CustomerNotificationComponent],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent { }
