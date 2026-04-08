import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { EnvConfigService } from '../../../core/config/env-config.service';
import {
  mapApiResponseToGridResponse,
  mapGridParamsToApiParams,
  paramMappers,
} from '../../utilities.ts/param-mapper.utils';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  headers = new HttpHeaders();
  apiUrl!: string;
  private envConfig = inject(EnvConfigService);

  constructor(private http: HttpClient) {
    this.apiUrl = this.envConfig.config.apiURL;
  }

  getRegions(): Observable<any> {
    // get regions from this file "../regions.json"
    return this.http.get('assets/regions.json');
  }

  // getData(getLink? : string, data?: any): Observable<any> {
  //   return this.http.get('assets/domains.json');
  // }
  getData(getLink?: string, data?: any): Observable<any> {
    const mapper = getLink ? paramMappers[getLink] : undefined;
    const apiParams = mapper ? mapper(data) : data;

    return this.http.post<any>(`${this.apiUrl}${getLink}`, apiParams).pipe(
      map((res) => {
        return mapApiResponseToGridResponse(res);
      }),
      catchError((error) => {
        return of({
          rows: [],
          count: 0,
          error: error.error?.errorMessage || 'Something went wrong',
        });
      })
    );
  }

  updateData(updateLink: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/` + updateLink, data);
  }

  deleteData(deleteLink: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/` + deleteLink);
  }

  getDefaultCurrency(): Observable<any> {
    return this.http.get(`${this.apiUrl}/currency-default/`);
  }
}
