import { Component, computed, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { DatePipe } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { firstValueFrom } from 'rxjs';
import { ProfileUserResponse } from '../../interfaces/profile-user.interface';

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
  private profileService = inject(ProfileService);

  profileUserResource = resource({
    loader: async () => {
      try {
        return await firstValueFrom(this.profileService.getProfileUser());
      } catch (err: any) {
        console.error('profile loader error:', err);
        return null;
      }
    } 
  })

  get profileUser() {
    return this.profileUserResource;
  }


  now = new Date();

  creditData: CreditData = {
    currentBalance: 150.75,
    currency: 'MEX',
  }


  get role() {
    const roles = this.profileUser?.value()?.user.customRole || [];
    if (roles == 1) return 'Organizador';
    if (roles == 0) return 'Asistente';
    return 'Asistente';
  }
}
