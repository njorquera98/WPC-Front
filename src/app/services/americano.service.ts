import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AmericanoService {
  private apiUrl = 'http://localhost:3000/americano';

  constructor(private http: HttpClient) { }

  nuevoAmericano(nombre: string, fecha: string): Observable<any> {
    const body = {
      nombre: nombre,
      fecha: fecha
    };
    return this.http.post(this.apiUrl, body);
  }
}
