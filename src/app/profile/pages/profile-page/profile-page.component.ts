import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-profile-page',
  imports: [MatIconModule, RouterLink],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent { 
  private authService = inject(AuthService);  

  user = computed(() => this.authService.user());

}
