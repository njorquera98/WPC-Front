import { Component, EventEmitter, Output, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoService } from '../services/grupo.service';
import { PartidoService } from '../services/partido.service';
import { Grupo } from '../models/grupo.model';
import { Partido } from '../models/partido.model';
import { AmericanoService } from '../services/americano.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Pareja } from '../models/pareja.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  modalRef: any;

  @ViewChild('content') content!: TemplateRef<any>;

  @Output() partidoSeleccionado = new EventEmitter<number>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private grupoService: GrupoService,
    private partidoService: PartidoService,
    private americanoService: AmericanoService,
    private modalService: NgbModal
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

  open(content: TemplateRef<any>) {
    if (this.partido) {
      this.modalRef = this.modalService.open(content);
    } else {
      console.error('No hay un partido seleccionado para mostrar en el modal');
    }
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
      this.partido = partido;
      this.pareja1Nombre = partido.pareja1.nombre_pareja || '';
      this.pareja2Nombre = partido.pareja2.nombre_pareja || '';
      this.resultadoPareja1 = partido.resultadoPareja1 || 0;
      this.resultadoPareja2 = partido.resultadoPareja2 || 0;
      console.log('Modificando resultado para el partido con ID:', partido.id);
      this.open(this.content); // Asegúrate de que `this.content` es el `TemplateRef` del modal
    } else {
      console.error('El partido o las parejas no están definidos');
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

  guardarCambios(partido: Partido): void {
    if (!partido.id) {
      console.error('Error: el ID del partido es indefinido');
      return;
    }

    // Actualiza los valores en el objeto `partido` con los valores de los inputs
    partido.resultadoPareja1 = this.resultadoPareja1;
    partido.resultadoPareja2 = this.resultadoPareja2;

    console.log("antes", partido);

    const partidoActualizado = {
      resultadoPareja1: partido.resultadoPareja1,
      resultadoPareja2: partido.resultadoPareja2,
    };

    this.partidoService.actualizarPartido(partido.id, partidoActualizado)
      .subscribe({
        next: response => {
          console.log('Partido actualizado con éxito:', response);
          this.modalRef.close();
        },
        error: error => {
          console.error('Error al actualizar el partido:', error);
        }
      });
  }
}

