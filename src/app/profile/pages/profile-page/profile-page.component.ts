import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { DatePipe } from '@angular/common';

interface CreditData {
  currentBalance: number, 
  currency: string,
}

@Component({
  selector: 'app-profile-page',
  imports: [MatIconModule, RouterLink, DatePipe],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent { 
  private authService = inject(AuthService);  

  user = computed(() => this.authService.user());

  now = new Date();

  creditData: CreditData = {
    currentBalance: 150.75,
    currency: 'MEX',
  }
}
