import { Component } from '@angular/core';
import { FixtureAmericanoService } from '../fixture-americano.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent {
  cantidadParejas: number = 0;
  cantidadCanchas: number = 0;
  cantidadGrupos: number = 0;
  fechaInicio: string = '';
  horaInicio: string = '';
  parejas: { nombre: string }[] = [];
  grupos: {
    nombre: string,
    parejas: { nombre: string }[],
    partidos: {
      pareja1: string,
      pareja2: string,
      resultado: string,
      horaPartido: string, // Nueva propiedad: hora del partido
      numeroCancha: number // Nueva propiedad: número de cancha
    }[]
  }[] = [];

  constructor(
    private router: Router,
    private torneoService: FixtureAmericanoService
  ) { }

  onCantidadParejasChange() {
    this.parejas = Array.from({ length: this.cantidadParejas }, (_, index) => ({
      nombre: `Pareja ${index + 1}`
    }));
    this.grupos = [];
  }

  onSubmit() {
    this.grupos = Array.from({ length: this.cantidadGrupos }, (_, index) => ({
      nombre: `Grupo ${index + 1}`,
      parejas: [],
      partidos: []
    }));

    // Mezclar las parejas aleatoriamente
    const parejasMezcladas = this.shuffleArray(this.parejas);

    parejasMezcladas.forEach((pareja, index) => {
      const groupIndex = index % this.cantidadGrupos;
      this.grupos[groupIndex].parejas.push(pareja);
    });

    // Generar partidos para cada grupo
    this.grupos.forEach(grupo => {
      for (let i = 0; i < grupo.parejas.length; i++) {
        for (let j = i + 1; j < grupo.parejas.length; j++) {
          // Aquí asignamos la hora del partido y el número de cancha
          grupo.partidos.push({
            pareja1: grupo.parejas[i].nombre,
            pareja2: grupo.parejas[j].nombre,
            resultado: '',
            horaPartido: '', // Debes definir cómo obtendrás esta hora
            numeroCancha: 0 // Debes definir cómo obtendrás este número
          });
        }
      }
    });

    // Guardar los datos adicionales en el servicio
    this.torneoService.setDatosTorneo({
      fechaInicio: this.fechaInicio,
      horaInicio: this.horaInicio
    });

    // Guardar los grupos en el servicio
    this.torneoService.setGrupos(this.grupos);

    // Navegar al componente Americano
    this.navigateToAmericano();
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  navigateToAmericano() {
    this.router.navigate(['/americano']);
  }

  onResultadoChange(grupoIndex: number, partidoIndex: number, resultado: string) {
    this.grupos[grupoIndex].partidos[partidoIndex].resultado = resultado;

    // Guardar los grupos en el servicio
    this.torneoService.setGrupos(this.grupos);
  }
}

