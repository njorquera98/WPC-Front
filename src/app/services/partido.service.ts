import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partido } from '../models/partido.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartidoService {

  private apiUrl = `${environment.apiUrl}/partidos`;

  constructor(private http: HttpClient) { }

  getPartidoPorId(partidoId: number): Observable<Partido> {
    return this.http.get<Partido>(`${this.apiUrl}/${partidoId}`);
  }

  crearPartido(partido: Partido): Observable<Partido> {
    return this.http.post<Partido>(this.apiUrl, partido);
  }

  getPartidosPorAmericano(americanoId: number): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${this.apiUrl}/americano/${americanoId}`);
  }

  actualizarPartido(id: number, partido: { resultadoPareja1?: number, resultadoPareja2?: number }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, partido);
  }


}


