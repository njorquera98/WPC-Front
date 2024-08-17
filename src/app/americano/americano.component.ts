import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GrupoService } from '../services/grupo.service';
import { PartidoService } from '../services/partido.service';
import { Grupo } from '../models/grupo.model';
import { Partido } from '../models/partido.model';
import { AmericanoService } from '../services/americano.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Pareja } from '../models/pareja.model';

@Component({
  selector: 'app-americano',
  templateUrl: './americano.component.html',
  styleUrls: ['./americano.component.css']
})
export class AmericanoComponent implements OnInit {
  americanoId!: number;
  nombreAmericano: string = '';
  grupos: Grupo[] = [];
  fechaInicioTorneo!: Date;

  pareja1Nombre: string = '';
  pareja2Nombre: string = '';
  resultadoPareja1!: number;
  resultadoPareja2!: number;

  selectedPartidoId?: number;
  partido: Partido | undefined;

  @Output() partidoSeleccionado = new EventEmitter<number>();

  constructor(
    private route: ActivatedRoute,
    private grupoService: GrupoService,
    private partidoService: PartidoService,
    private americanoService: AmericanoService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.americanoId = +id; // Convierte el id a número
        console.log('Cargando datos para el Americano con ID:', this.americanoId);
        this.loadAmericano();
      } else {
        console.error('americanoId no está definido en la URL');
      }
    });
  }

  loadAmericano() {
    this.americanoService.getAmericano(this.americanoId).subscribe(
      (americano) => {
        console.log('Americano cargado:', americano);
        this.fechaInicioTorneo = new Date(americano.fechaInicio);
        this.nombreAmericano = americano.nombre;
        this.loadGrupos();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar el americano', error);
      }
    );
  }

  loadGrupos() {
    this.grupoService.getGruposPorAmericano(this.americanoId).subscribe(
      (grupos: Grupo[]) => {
        console.log('Grupos cargados:', grupos);
        this.grupos = grupos.map(grupo => ({
          ...grupo,
          parejas: [],
          partidos: []
        }));
        this.loadParejas();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los grupos', error);
      }
    );
  }

  loadParejas() {
    this.grupoService.getParejasPorAmericano(this.americanoId).subscribe(
      (parejas: Pareja[]) => {
        parejas.forEach((pareja: Pareja) => {
          const grupoId = pareja.grupo?.id;
          if (grupoId !== undefined) {
            const grupo = this.grupos.find(g => g.id === grupoId);
            if (grupo) {
              if (!grupo.parejas) {
                grupo.parejas = [];
              }
              grupo.parejas.push(pareja);
            }
          }
        });
        this.loadPartidos();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar las parejas', error);
      }
    );
  }

  loadPartidos() {
    this.partidoService.getPartidosPorAmericano(this.americanoId).subscribe(
      (partidos: Partido[]) => {
        console.log('Partidos cargados:', partidos);
        partidos.forEach((partido: Partido) => {
          const grupoId = partido.grupo?.id;
          if (grupoId !== undefined) {
            const grupo = this.grupos.find(g => g.id === grupoId);
            if (grupo) {
              if (!grupo.partidos) {
                grupo.partidos = [];
              }
              grupo.partidos.push(partido);
            }
          }
        });
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los partidos', error);
      }
    );
  }


  modificarResultado(partido: Partido): void {
    if (partido && partido.pareja1 && partido.pareja2 && partido.id !== undefined) {
      this.cargarPartido(partido.id);
      this.pareja1Nombre = partido.pareja1.nombre_pareja || '';
      this.pareja2Nombre = partido.pareja2.nombre_pareja || '';
      this.resultadoPareja1 = partido.resultadoPareja1 || 0;
      this.resultadoPareja2 = partido.resultadoPareja2 || 0;
      this.selectedPartidoId = partido.id;
      console.log('Modificar resultado para el partido con ID:', partido.id);
    } else {
      console.error('El partido, las parejas o el ID no están definidos');
    }
  }


  cargarPartido(id: number): void {
    this.partidoService.getPartidoPorId(id).subscribe(
      (partido: Partido) => {
        this.partido = partido;
        console.log('Partido cargado:', this.partido);
        this.pareja1Nombre = partido.pareja1?.nombre_pareja || '';
        this.pareja2Nombre = partido.pareja2?.nombre_pareja || '';
        this.resultadoPareja1 = partido.resultadoPareja1 || 0;
        this.resultadoPareja2 = partido.resultadoPareja2 || 0;
      },
      (error) => {
        console.error('Error al cargar el partido:', error);
      }
    );
  }

  guardarCambios(): void {
    if (this.selectedPartidoId !== undefined && this.partido) {
      const partidoActualizado: Partido = {
        ...this.partido,
        resultadoPareja1: this.resultadoPareja1,
        resultadoPareja2: this.resultadoPareja2
      };
      this.partidoService.actualizarPartido(this.selectedPartidoId, partidoActualizado).subscribe(
        () => {
          console.log('Partido actualizado con éxito');
          this.loadPartidos(); // Vuelve a cargar los partidos después de actualizar
        },
        (error) => {
          console.error('Error al actualizar el partido:', error);
        }
      );
    }
  }

}

