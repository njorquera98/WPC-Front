import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partido } from '../models/partido.model';
import { CrearPartidoPayload } from '../models/createPartido.model';

@Injectable({
  providedIn: 'root'
})
export class PartidoService {
  private apiUrl = 'http://localhost:3000/partidos';

  constructor(private http: HttpClient) { }

  getPartidos(): Observable<Partido[]> {
    return this.http.get<Partido[]>(this.apiUrl);
  }

  crearPartido(partido: CrearPartidoPayload): Observable<CrearPartidoPayload> {
    return this.http.post<Partido>(this.apiUrl, partido);
  }
}

