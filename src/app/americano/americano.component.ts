import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParejaService } from '../services/pareja.service';
import { Pareja } from '../models/pareja.model';

interface Grupo {
  nombre: string;
  partidos: Partido[];
}

interface Partido {
  pareja1: string;
  pareja2: string;
  resultado: string;
}

@Component({
  selector: 'app-americano',
  templateUrl: './americano.component.html',
  styleUrls: ['./americano.component.css']
})
export class AmericanoComponent implements OnInit {
  americanoId: string | null = null;
  cantidadGrupos: number = 0;
  fechaInicioTorneo: string = '';
  parejas: Pareja[] = [];
  grupos: Grupo[] = [];

  constructor(private route: ActivatedRoute, private parejaService: ParejaService) { }

  ngOnInit(): void {
    this.americanoId = this.route.snapshot.paramMap.get('id');
    this.cantidadGrupos = parseInt(this.route.snapshot.paramMap.get('grupos') || '0', 10);
    this.fechaInicioTorneo = this.route.snapshot.paramMap.get('fechaInicio') || '';

    console.log('ID del americano:', this.americanoId);
    console.log('Cantidad de grupos:', this.cantidadGrupos);
    console.log('Fecha de inicio del torneo:', this.fechaInicioTorneo);

    if (!this.americanoId || this.cantidadGrupos <= 0 || !this.fechaInicioTorneo) {
      console.error('Faltan parámetros necesarios en la ruta');
      return;
    }

    if (this.americanoId) {
      this.parejaService.getParejasByAmericanoId(this.americanoId).subscribe(
        (parejas: Pareja[]) => {
          this.parejas = parejas;
          this.organizarPorGrupos();
        },
        error => {
          console.error('Error al obtener las parejas', error);
          // Manejo de errores
        }
      );
    } else {
      console.error('No se encontró el ID del torneo en la ruta');
    }
  }

  organizarPorGrupos() {
    const grupos: Grupo[] = [];

    // Distribuir parejas en grupos de manera equitativa
    for (let i = 0; i < this.cantidadGrupos; i++) {
      const grupo: Grupo = {
        nombre: `Grupo ${i + 1}`,
        partidos: []
      };

      // Calcular el rango de parejas para este grupo
      const inicio = i * Math.ceil(this.parejas.length / this.cantidadGrupos);
      const fin = Math.min((i + 1) * Math.ceil(this.parejas.length / this.cantidadGrupos), this.parejas.length);

      // Generar los partidos para este grupo
      for (let j = inicio; j < fin; j++) {
        for (let k = j + 1; k < fin; k++) {
          grupo.partidos.push({
            pareja1: this.parejas[j].nombre_pareja,
            pareja2: this.parejas[k].nombre_pareja,
            resultado: ''
          });
        }
      }

      grupos.push(grupo);
    }

    this.grupos = grupos;
    console.log(this.grupos); // Verifica en la consola que los grupos estén correctamente organizados
  }


  calcularHorarioPartido(index: number): string {
    // Lógica para calcular el horario del partido basado en el índice
    return `Horario ${index + 1}`;
  }
}
