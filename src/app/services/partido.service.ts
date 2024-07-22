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

  crearPartido(partido: Partido): Observable<Partido> {
    return this.http.post<Partido>(this.apiUrl, partido);
  }
}


