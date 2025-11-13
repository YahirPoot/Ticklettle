import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { ProfileUser } from '../interfaces/profile-user.interface';
import { catchError } from 'rxjs';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  getProfileUser() {
    return this.http.get<ProfileUser>(`${apiBaseUrl}/Auth/profile`)
  }
}
