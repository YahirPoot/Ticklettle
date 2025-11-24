import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { Observable, tap } from 'rxjs';
import { ResponseAnalitycsInterface } from '../interfaces';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export default class AnalyticsService {
  private http = inject(HttpClient);


    getMyAnalytics(): Observable<ResponseAnalitycsInterface> {
      return this.http.get<ResponseAnalitycsInterface>(`${apiBaseUrl}/Analytics/my-analytics`)
        .pipe(
          tap(res => console.log('Analytics obtenidos -', res))
        );
    }
}
