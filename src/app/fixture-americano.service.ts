import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FixtureAmericanoService {
  private grupos: any[] = [];
  private datosTorneo: any = {};
  private fechaInicioTorneo: string = '';

  constructor() { }

  setGrupos(grupos: any[]) {
    this.grupos = grupos;
  }

  getGrupos() {
    return this.grupos;
  }

  setDatosTorneo(datos: any) {
    this.datosTorneo = datos;
  }

  getDatosTorneo() {
    return this.datosTorneo;
  }

  setFechaInicioTorneo(fechaInicio: string) {
    this.fechaInicioTorneo = fechaInicio;
  }

  getFechaInicioTorneo() {
    return this.fechaInicioTorneo;
  }
}
