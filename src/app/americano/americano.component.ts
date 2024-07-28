import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartidoService } from '../services/partido.service';
import { GrupoService } from '../services/grupo.service';
import { ParejaService } from '../services/pareja.service';
import { Grupo } from '../models/grupo.model';
import { Partido } from '../models/partido.model';
import { Pareja } from '../models/pareja.model';
import { AmericanoService } from '../services/americano.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-americano',
  templateUrl: './americano.component.html',
  styleUrls: ['./americano.component.css']
})
export class AmericanoComponent implements OnInit {
  americanoId!: number;
  grupos: (Grupo & { parejas?: Pareja[], partidos?: Partido[] })[] = [];
  parejas: Pareja[] = [];
  partidos: Partido[] = [];
  fechaInicioTorneo!: Date;

  constructor(
    private route: ActivatedRoute,
    private partidoService: PartidoService,
    private grupoService: GrupoService,
    private parejaService: ParejaService,
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
        this.grupos = grupos.map(grupo => ({ ...grupo, parejas: [], partidos: [] }));
        this.loadParejas(); // Cargar parejas después de cargar los grupos
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los grupos', error);
      }
    );
  }

  loadParejas() {
    this.parejaService.obtenerParejasPorAmericano(this.americanoId).subscribe(
      (parejas: Pareja[]) => {
        console.log('Parejas cargadas:', parejas);
        this.parejas = parejas;
        // Asignar parejas a los grupos
        this.grupos.forEach(grupo => {
          grupo.parejas = this.parejas.filter(pareja => pareja.grupo_fk === grupo.id);
        });
        this.loadPartidos(); // Cargar partidos después de cargar las parejas
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar las parejas', error);
      }
    );
  }

  loadPartidos() {
    this.partidoService.obtenerPartidosPorAmericano(this.americanoId).subscribe(
      (partidos: Partido[]) => {
        console.log('Partidos cargados:', partidos);
        this.partidos = partidos;
        // Asignar partidos a los grupos
        this.grupos.forEach(grupo => {
          grupo.partidos = this.partidos.filter(partido => partido.grupo_fk === grupo.id);
        });
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los partidos', error);
      }
    );
  }

  calcularHorarioPartido(partido: Partido): string {
    const inicio = new Date(this.fechaInicioTorneo);
    const diferencia = (this.partidos.indexOf(partido) + 1) * 20; // Ajusta según la lógica
    inicio.setMinutes(inicio.getMinutes() + diferencia);
    return inicio.toLocaleTimeString();
  }

  getParejasPorGrupo(grupo: Grupo & { parejas?: Pareja[] }): Pareja[] {
    return grupo.parejas || [];
  }

  getPartidosPorGrupo(grupo: Grupo & { partidos?: Partido[] }): Partido[] {
    return grupo.partidos || [];
  }

  obtenerNombrePareja(parejaId: number): string {
    const pareja = this.parejas.find(p => p.id === parejaId);
    return pareja ? pareja.nombre_pareja : 'Desconocido';
  }
}

