import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Grupo } from "../models/grupo.model";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) { }

  crearGrupo(grupo: Grupo): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, grupo);
  }

  obtenerGruposPorAmericano(americanoId: number): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(`${this.apiUrl}/americano/${americanoId}`);
  }
}

