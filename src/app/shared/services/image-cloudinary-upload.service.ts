import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { Observable } from 'rxjs';

const apiBaseUrl = environment.apiBaseUrl;
@Injectable({
  providedIn: 'root'
})
export class ImageCloudinaryUploadService {
  private http =  inject(HttpClient);

  uploadImageToCloudinary(formData: FormData): Observable<{url: string}> {
    return this.http.post<{url: string}>(`${apiBaseUrl}/Cloudinary/upload`, formData);
  }
  
}
