import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParejaService } from '../services/pareja.service';
import { Pareja } from '../models/pareja.model';
import { Americano } from '../models/americano.model';
import { Partido } from '../models/partido.model';
import { PartidoService } from '../services/partido.service';
import { CanchaService } from '../services/cancha.service';
import { Cancha } from '../models/cancha.model';
import { Grupo } from '../models/grupo.model';
import { AmericanoService } from '../services/americano.service';
import { CrearPartidoPayload } from '../models/createPartido.model';

@Component({
  selector: 'app-americano',
  templateUrl: './americano.component.html',
  styleUrls: ['./americano.component.css']
})
export class AmericanoComponent implements OnInit {
  americanoId: string | null = null;
  cantidadGrupos: number = 0;
  fechaInicioTorneo: Date | null = null;
  parejas: Pareja[] = [];
  grupos: Grupo[] = [];
  nombreAmericano: string = '';
  numeroCancha: string = '';
  canchas: Cancha[] = [];
  resultadosPorPareja: { [key: number]: string } = {}; // Definir la variable para almacenar los resultados

  constructor(
    private route: ActivatedRoute,
    private parejaService: ParejaService,
    private americanoService: AmericanoService,
    private partidoService: PartidoService,
    private canchaService: CanchaService
  ) { }

  ngOnInit(): void {
    this.americanoId = this.route.snapshot.paramMap.get('id');

    if (!this.americanoId) {
      console.error('Faltan parámetros necesarios en la ruta');
      return;
    }

    this.americanoService.getAmericano(this.americanoId).subscribe(
      (americano: Americano) => {
        this.cantidadGrupos = americano.cantidadGrupos;
        this.fechaInicioTorneo = new Date(americano.fechaInicio);
        this.nombreAmericano = americano.nombre;

        this.canchaService.getCanchas().subscribe(
          (canchas: Cancha[]) => {
            this.canchas = canchas;
            this.numeroCancha = canchas.length > 0 ? canchas[0].numeroCancha : '';
            this.getParejas();
          },
          (error: any) => {
            console.error('Error al obtener las Canchas', error);
          }
        );
      },
      (error: any) => {
        console.error('Error al obtener el Americano', error);
      }
    );
  }

  getParejas() {
    if (this.americanoId) {
      this.parejaService.getParejasByAmericanoId(this.americanoId).subscribe(
        (parejas: Pareja[]) => {
          console.log('Parejas obtenidas:', parejas);
          this.parejas = parejas;
          this.organizarPorGrupos();
          this.llenarResultadosPorPareja();
        },
        (error: any) => {
          console.error('Error al obtener las parejas', error);
        }
      );
    } else {
      console.error('El ID del americano es nulo');
    }
  }

  organizarPorGrupos() {
    if (this.parejas.length === 0) {
      console.warn('No se han obtenido parejas aún. Revisar la implementación de getParejas()');
      return;
    }

    const grupos: Grupo[] = [];
    const parejasPorGrupo = Math.ceil(this.parejas.length / this.cantidadGrupos);

    for (let i = 0; i < this.cantidadGrupos; i++) {
      const grupo: Grupo = {
        id: i + 1,
        nombreGrupo: `Grupo ${i + 1}`,
        partidos: [],
        americano_fk: +this.americanoId!
      };

      const inicio = i * parejasPorGrupo;
      const fin = Math.min(inicio + parejasPorGrupo, this.parejas.length);

      for (let j = inicio; j < fin; j++) {
        for (let k = j + 1; k < fin; k++) {
          const pareja1Id = this.parejas[j]?.id;
          const pareja2Id = this.parejas[k]?.id;

          if (pareja1Id !== undefined && pareja2Id !== undefined) {
            const nuevoPartido: Partido = {
              pareja1: this.parejas[j],
              pareja2: this.parejas[k],
              resultadoPareja1: 0,
              resultadoPareja2: 0,
              fecha: this.fechaInicioTorneo ? new Date(this.fechaInicioTorneo) : new Date(),
              grupo: grupo,
              americano: {
                id: +this.americanoId!,
                nombre: this.nombreAmericano,
                fechaInicio: this.fechaInicioTorneo?.toISOString() || '',
                cantidadGrupos: this.cantidadGrupos
              },
              cancha: {
                id: this.canchas[0]?.id || 0,
                numeroCancha: this.numeroCancha
              },
              pareja1_fk: pareja1Id,
              pareja2_fk: pareja2Id,
              grupo_fk: grupo.id,
              americano_fk: +this.americanoId!,
              cancha_fk: this.canchas[0]?.id || 0
            };

            this.crearPartidoEnBackend(nuevoPartido);
            grupo.partidos.push(nuevoPartido);
          }
        }
      }

      grupos.push(grupo);
    }

    this.grupos = grupos;
    console.log('Grupos organizados:', this.grupos);
  }


  crearPartidoEnBackend(partido: Partido) {
    // Construir el payload utilizando la nueva interfaz
    const payload: CrearPartidoPayload = {
      resultadoPareja1: partido.resultadoPareja1,
      resultadoPareja2: partido.resultadoPareja2,
      fecha: partido.fecha,
      pareja1_fk: partido.pareja1_fk,
      pareja2_fk: partido.pareja2_fk,
      grupo_fk: partido.grupo_fk,
      americano_fk: partido.americano_fk,
      cancha_fk: partido.cancha_fk,
    };

    console.log('Formato', payload);

    // Llamar al servicio para crear el partido
    this.partidoService.crearPartido(payload).subscribe(
      (response: any) => {
        console.log('Partido creado exitosamente:', response);
      },
      (error: any) => {
        console.error('Error al crear el partido:', error);
      }
    );
  }



  llenarResultadosPorPareja() {
    for (const grupo of this.grupos) {
      for (const partido of grupo.partidos) {
        const pareja1Id = partido.pareja1.id;
        const pareja2Id = partido.pareja2.id;

        if (pareja1Id && pareja2Id) {
          if (!this.resultadosPorPareja[pareja1Id]) {
            this.resultadosPorPareja[pareja1Id] = '';
          }
          if (!this.resultadosPorPareja[pareja2Id]) {
            this.resultadosPorPareja[pareja2Id] = '';
          }

          this.resultadosPorPareja[pareja1Id] += ` vs ${partido.pareja2.nombre_pareja} (${partido.resultadoPareja1} - ${partido.resultadoPareja2})`;
          this.resultadosPorPareja[pareja2Id] += ` vs ${partido.pareja1.nombre_pareja} (${partido.resultadoPareja2} - ${partido.resultadoPareja1})`;
        }
      }
    }
  }

  getParejasPorGrupo(grupo: Grupo): Pareja[] {
    return this.parejas.filter(pareja => pareja.americano_fk === grupo.americano_fk);
  }

  calcularHorarioPartido(index: number): string {
    return `Horario ${index + 1}`;
  }
}

