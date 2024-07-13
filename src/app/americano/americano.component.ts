import { Component, OnInit } from '@angular/core';
import { FixtureAmericanoService } from '../fixture-americano.service';

@Component({
  selector: 'app-americano',
  templateUrl: './americano.component.html',
  styleUrls: ['./americano.component.css']
})
export class AmericanoComponent implements OnInit {
  grupos: any[] = [];
  fechaInicioTorneo: string = '';

  constructor(private torneoService: FixtureAmericanoService) { }

  ngOnInit(): void {
    // Obtener la fecha de inicio del torneo desde el servicio
    this.fechaInicioTorneo = this.torneoService.getFechaInicioTorneo();
    console.log('Fecha de inicio del torneo obtenida:', this.fechaInicioTorneo);

    // Suponiendo que también obtienes los grupos desde el servicio
    this.grupos = this.torneoService.getGrupos();
    console.log('Grupos cargados:', this.grupos);
  }

  calcularHorarioPartido(partidoIndex: number): string {


    const inicioTorneo = new Date(this.fechaInicioTorneo);
    const horarioPrimerPartido = new Date(inicioTorneo);
    const horarioSegundoPartido = new Date(inicioTorneo);

    horarioSegundoPartido.setMinutes(horarioPrimerPartido.getMinutes() + 20);

    if (partidoIndex === 0) {
      return horarioPrimerPartido.toLocaleTimeString();
    } else if (partidoIndex === 1) {
      return horarioSegundoPartido.toLocaleTimeString();
    }

    return '';
  }
}
