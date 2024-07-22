import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Americano } from '../models/americano.model';

@Injectable({
  providedIn: 'root'
})
export class AmericanoService {
  private apiUrl = 'http://localhost:3000/americano';

  constructor(private http: HttpClient) { }

  nuevoAmericano(nombre: string, fecha: string, cantidadGrupos: number): Observable<Americano[]> {
    const body = { nombre, fechaInicio: fecha, cantidadGrupos };
    return this.http.post<Americano[]>(this.apiUrl, body);
  }

  getAmericano(id: number): Observable<Americano> {
    return this.http.get<Americano>(`${this.apiUrl}/${id}`);
  }
}
