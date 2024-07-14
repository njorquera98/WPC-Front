import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pareja } from '../models/pareja.model';

@Injectable({
  providedIn: 'root'
})
export class ParejaService {
  private apiUrl = 'http://localhost:3000/parejas';

  constructor(private http: HttpClient) { }

  nuevaPareja(pareja: Pareja): Observable<any> {
    return this.http.post(this.apiUrl, pareja);
  }
}
