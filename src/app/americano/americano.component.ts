import { Component, OnInit } from '@angular/core';
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
    console.log("Americano ID antes del service", this.americanoId);
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

  calcularHorarioPartido(partido: Partido): string {
    const inicio = new Date(this.fechaInicioTorneo);
    const diferencia = (this.grupos.flatMap(g => g.partidos).indexOf(partido) + 1) * 20; // Ajusta según la lógica
    inicio.setMinutes(inicio.getMinutes() + diferencia);
    return inicio.toLocaleTimeString();
  }
}

