import { Component, computed, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { DatePipe, CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component'; // 👈
import { firstValueFrom } from 'rxjs';
import { ProfileUserResponse } from '../../interfaces/profile-user.interface';

interface CreditData {
  currentBalance: number, 
  currency: string,
}

@Component({
  selector: 'app-profile-page',
  imports: [MatIconModule, RouterLink, DatePipe, CommonModule,ConfirmModalComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent { 
  private authService = inject(AuthService);  
  private profileService = inject(ProfileService);
  private router = inject(Router);


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
    // console.log('profileUserResource', this.profileUserResource.value());
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
  showDeleteAccountModal = false;

  openDeleteAccountModal() {
    this.showDeleteAccountModal = true;
  }

  closeDeleteAccountModal() {
    this.showDeleteAccountModal = false;
  }

  async confirmDeleteAccount() {
    try {
      await firstValueFrom(this.profileService.deleteAccount());
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
    }
  }
}

