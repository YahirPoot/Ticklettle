import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterOutlet],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  // Datos simulados del usuario
  user = {
    name: 'Wendy',
    lastName: 'Pacheco',
    email: 'wendy@gmail.com',
    phone: '+52 9973553129',
    location: 'Mérida, Yucatán',
    profilePic: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=W', // Placeholder para la imagen
  };
}
