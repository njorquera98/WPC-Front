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
  resultadosPorPareja: { [key: number]: string } = {}; // Variable para almacenar los resultados por pareja
  loading: boolean = true;
  errorLoadingData: boolean = false;

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
      this.errorLoadingData = true;
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
            this.loading = false;
          },
          (error: any) => {
            console.error('Error al obtener las Canchas', error);
            this.errorLoadingData = true;
            this.loading = false;
          }
        );
      },
      (error: any) => {
        console.error('Error al obtener el Americano', error);
        this.errorLoadingData = true;
        this.loading = false;
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
          this.llenarResultadosPorPareja(); // Llenar resultados por pareja
        },
        (error: any) => {
          console.error('Error al obtener las parejas', error);
          this.errorLoadingData = true;
        }
      );
    } else {
      console.error('El ID del americano es nulo');
      this.errorLoadingData = true;
    }
  }


  organizarPorGrupos() {
    if (this.parejas.length === 0) {
      console.warn('No se han obtenido parejas aún. Revisar la implementación de getParejas()');
      return;
    }

    const grupos: Grupo[] = [];
    const parejasPorGrupo = Math.ceil(this.parejas.length / this.cantidadGrupos);

    // Ordenar parejas por ID (o cualquier otro criterio de orden)
    this.parejas.sort((a, b) => {
      if (a.id !== undefined && b.id !== undefined) {
        return a.id - b.id;
      }
      return 0;
    });

    // Calcular la fecha del primer partido (hora de inicio del torneo)
    const fechaPrimerPartido = this.fechaInicioTorneo ? new Date(this.fechaInicioTorneo) : new Date();

    for (let i = 0; i < this.cantidadGrupos; i++) {
      const grupo: Grupo = {
        id: i + 1,
        nombreGrupo: `Grupo ${i + 1}`,
        partidos: [],
        americano_fk: +this.americanoId!
      };

      const inicio = i * parejasPorGrupo;
      const fin = Math.min(inicio + parejasPorGrupo, this.parejas.length);

      const parejaUsada: Set<number> = new Set(); // Conjunto para evitar repetición de parejas

      for (let j = inicio; j < fin; j++) {
        for (let k = j + 1; k < fin; k++) {
          const pareja1Id = this.parejas[j]?.id;
          const pareja2Id = this.parejas[k]?.id;

          if (pareja1Id !== undefined && pareja2Id !== undefined && !parejaUsada.has(pareja1Id) && !parejaUsada.has(pareja2Id)) {
            const partido1: Partido = {
              pareja1: this.parejas[j],
              pareja2: this.parejas[k],
              resultadoPareja1: 0,
              resultadoPareja2: 0,
              fecha: new Date(fechaPrimerPartido.getTime()), // Fecha del primer partido (inicialmente igual)
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

            grupo.partidos.push(partido1);
            parejaUsada.add(pareja1Id);
            parejaUsada.add(pareja2Id);

            // Calcular la fecha del segundo partido (20 minutos después del primero)
            const fechaSegundoPartido = new Date(fechaPrimerPartido.getTime());
            fechaSegundoPartido.setMinutes(fechaSegundoPartido.getMinutes() + 20);

            const partido2: Partido = {
              pareja1: this.parejas[j],
              pareja2: this.parejas[k],
              resultadoPareja1: 0,
              resultadoPareja2: 0,
              fecha: fechaSegundoPartido, // Fecha del segundo partido
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

            grupo.partidos.push(partido2);
          }
        }
      }

      grupos.push(grupo);
    }

    // Ordenar los partidos dentro de cada grupo por fecha
    grupos.forEach(grupo => {
      grupo.partidos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    });

    this.grupos = grupos;
    console.log('Grupos organizados:', this.grupos);
  }

  llenarResultadosPorPareja() {
    // Llenar resultados por pareja
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
    // Filtrar y obtener parejas por grupo
    return this.parejas.filter(pareja => pareja.americano_fk === grupo.americano_fk);
  }


  calcularHorarioPartido(index: number): string {
    if (this.grupos.length === 0) {
      return ''; // Si no hay grupos, no se puede calcular el horario
    }

    const ultimoPartido = this.grupos[this.grupos.length - 1].partidos[index];
    const fechaUltimoPartido = ultimoPartido.fecha || new Date();

    // Calcular la fecha del siguiente partido (20 minutos después)
    const fechaSiguientePartido = new Date(fechaUltimoPartido.getTime());
    fechaSiguientePartido.setMinutes(fechaSiguientePartido.getMinutes() + 20);

    return fechaSiguientePartido.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
  }

}

