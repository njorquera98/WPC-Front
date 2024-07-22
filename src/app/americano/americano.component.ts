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
  grupos: Grupo[] = [];
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
        this.loadGrupos();
        this.loadParejas();
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
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar el americano', error);
      }
    );
  }

  loadGrupos() {
    console.log("Americano ID antes del service", this.americanoId);
    this.grupoService.obtenerGruposPorAmericano(this.americanoId).subscribe(
      (grupos: Grupo[]) => {
        console.log('Grupos cargados:', grupos);
        this.grupos = grupos;
        this.assignParejasToGroups(); // Asigna las parejas a los grupos aleatoriamente después de cargar los grupos
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
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar las parejas', error);
      }
    );
  }

  assignParejasToGroups() {
    if (!this.grupos.length || !this.parejas.length) {
      console.log('No se pueden asignar parejas a grupos, falta información de grupos o parejas.');
      return;
    }

    // Baraja las parejas aleatoriamente
    const shuffledParejas = [...this.parejas].sort(() => 0.5 - Math.random());

    // Asigna las parejas a los grupos de forma circular
    let groupIndex = 0;
    for (const pareja of shuffledParejas) {
      this.parejaService.actualizarPareja(pareja.id, { grupo_fk: this.grupos[groupIndex].id }).subscribe(
        (updatedPareja) => {
          console.log('Pareja asignada al grupo:', updatedPareja);
          pareja.grupo_fk = this.grupos[groupIndex].id;
          groupIndex = (groupIndex + 1) % this.grupos.length;
        },
        (error: HttpErrorResponse) => {
          console.error('Error al asignar pareja al grupo', error);
        }
      );
    }

    // Una vez asignadas las parejas a los grupos, crea los partidos
    this.createPartidos();
  }

  createPartidos() {
    if (!this.grupos.length || !this.parejas.length) {
      console.log('No se pueden crear partidos, falta información de grupos o parejas.');
      return;
    }

    this.partidos = []; // Reinicia el array de partidos

    this.grupos.forEach(grupo => {
      if (grupo.id === undefined) {
        console.error('Grupo ID no está definido');
        return;
      }

      const parejasEnGrupo = this.getParejasPorGrupo(grupo);

      if (parejasEnGrupo.length < 2) {
        console.log(`No hay suficientes parejas en el grupo ${grupo.nombreGrupo} para crear partidos.`);
        return;
      }

      for (let i = 0; i < parejasEnGrupo.length; i++) {
        for (let j = i + 1; j < parejasEnGrupo.length; j++) {
          const partido: Partido = {
            id: undefined,
            resultadoPareja1: 0,
            resultadoPareja2: 0,
            fecha: new Date(), // Ajusta la fecha según tu lógica
            pareja1_fk: parejasEnGrupo[i].id!,
            pareja2_fk: parejasEnGrupo[j].id!,
            grupo_fk: grupo.id,
            americano_fk: this.americanoId,
            cancha_fk: 1 // Ajusta según corresponda
          };
          console.log('Partido generado:', partido); // Agrega log para ver los partidos generados
          this.partidos.push(partido);
        }
      }

      this.savePartidos();
    });
  }

  savePartidos() {
    if (!this.partidos.length) {
      console.log('No hay partidos para guardar.');
      return;
    }

    this.partidos.forEach(partido => {
      this.partidoService.crearPartido(partido).subscribe(
        response => {
          console.log('Partido creado:', response);
        },
        (error: HttpErrorResponse) => {
          console.error('Error al crear el partido', error);
        }
      );
    });
  }

  getPartidosPorGrupo(grupo: Grupo): Partido[] {
    const partidosPorGrupo = this.partidos.filter(partido => partido.grupo_fk === grupo.id);
    console.log('Partidos por grupo', grupo.nombreGrupo, partidosPorGrupo);
    return partidosPorGrupo;
  }

  calcularHorarioPartido(partido: Partido): string {
    const inicio = new Date(this.fechaInicioTorneo);
    const diferencia = (this.partidos.indexOf(partido) + 1) * 20; // Ajusta según la lógica
    inicio.setMinutes(inicio.getMinutes() + diferencia);
    return inicio.toLocaleTimeString();
  }

  getParejasPorGrupo(grupo: Grupo): Pareja[] {
    const parejasPorGrupo = this.parejas.filter(pareja => pareja.grupo_fk === grupo.id);
    console.log('Parejas por grupo', grupo.nombreGrupo, parejasPorGrupo);
    return parejasPorGrupo;
  }

  obtenerNombrePareja(parejaId: number): string {
    const pareja = this.parejas.find(p => p.id === parejaId);
    return pareja ? pareja.nombre_pareja : 'Desconocido';
  }
}

