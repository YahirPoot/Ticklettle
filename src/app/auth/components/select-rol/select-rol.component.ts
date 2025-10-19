import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-select-rol',
  imports: [],
  templateUrl: './select-rol.component.html',
})
export class SelectRolComponent { 
  private authService = inject(AuthService);
  public async choose(role: 'asistente' | 'organizador') {
    await this.authService.completeRegistration(role);
  }
}
