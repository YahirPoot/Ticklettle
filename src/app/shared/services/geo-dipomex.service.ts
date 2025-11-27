import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';

const DEPOMEXAPIURL = environment.depomexApiUrl;
const APIKEYDEPOMEX = environment.apikeyDepomex;
@Injectable({
  providedIn: 'root'
})
export class GeoDipomexService {
  private http = inject(HttpClient);

  getInforForPostalCode() {

    return this.http.get(`${DEPOMEXAPIURL}/v1/cp()`)
  }
}
