import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pareja } from '../models/pareja.model';
import { Americano } from '../models/americano.model';

@Injectable({
  providedIn: 'root'
})
export class ParejaService {
  private apiUrl = 'http://localhost:3000/parejas';

  constructor(private http: HttpClient) { }

  nuevaPareja(pareja: Pareja): Observable<Pareja> {
    return this.http.post<Pareja>(this.apiUrl, pareja);
  }

  getParejasByAmericanoId(americanoId: string): Observable<Pareja[]> {
    return this.http.get<Pareja[]>(`${this.apiUrl}/americano/${americanoId}`);
  }

  getAmericanoById(id: string): Observable<Americano> {
    return this.http.get<Americano>(`${this.apiUrl}/americano/${id}`);
  }

  obtenerParejasPorAmericano(americanoId: number): Observable<Pareja[]> {
    return this.http.get<Pareja[]>(`${this.apiUrl}/americano/${americanoId}`);
  }


  actualizarPareja(parejaId: number, data: Partial<Pareja>): Observable<Pareja> {
    return this.http.put<Pareja>(`${this.apiUrl}/${parejaId}`, data);
  }

}
