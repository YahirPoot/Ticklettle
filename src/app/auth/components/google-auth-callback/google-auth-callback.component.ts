import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'google-auth-callback',
  imports: [],
  templateUrl: './google-auth-callback.component.html',
})
export class GoogleAuthCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  ngOnInit(): void {
    const raw = localStorage.getItem('user');
    if (!raw) {
      this.router.navigate(['/auth/login']);
      return
    }
    const user = JSON.parse(raw);

    this.authService.handleExternalLogin(user);
    // localStorage.removeItem('socialUser');
  } 
  
}
