import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cancha } from '../models/cancha.model';

@Injectable({
  providedIn: 'root'
})
export class CanchaService {
  private apiUrl = 'http://localhost:3000/canchas';

  constructor(private http: HttpClient) { }

  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(this.apiUrl);
  }

  getCancha(id: number): Observable<Cancha> {
    return this.http.get<Cancha>(`${this.apiUrl}/${id}`);
  }
}
