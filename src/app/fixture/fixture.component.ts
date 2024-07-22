import { Component, OnInit } from '@angular/core';
import { ParejaService } from '../services/pareja.service';
import { AmericanoService } from '../services/americano.service';
import { CanchaService } from '../services/cancha.service';
import { GrupoService } from '../services/grupo.service';
import { Pareja } from '../models/pareja.model';
import { Grupo } from '../models/grupo.model';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Cancha } from '../models/cancha.model';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {
  nombreAmericano: string = '';
  cantidadParejas: number = 0;
  cantidadGrupos: number = 0;
  fechaInicio: string = '';
  parejas: { nombre: string }[] = [];
  canchas: Cancha[] = [];
  selectedCanchas: { [key: string]: boolean } = {};

  constructor(
    private router: Router,
    private parejaService: ParejaService,
    private americanoService: AmericanoService,
    private canchaService: CanchaService,
    private grupoService: GrupoService
  ) { }

  ngOnInit() {
    this.loadCanchas();
  }

  loadCanchas() {
    this.canchaService.getCanchas().subscribe(
      (canchas: Cancha[]) => {
        this.canchas = canchas;
        this.selectedCanchas = canchas.reduce((acc, cancha) => {
          acc[cancha.numeroCancha] = false;
          return acc;
        }, {} as { [key: string]: boolean });
      },
      error => {
        console.error('Error al cargar las canchas', error);
      }
    );
  }

  onCantidadParejasChange() {
    this.parejas = Array(this.cantidadParejas).fill({}).map((_, i) => ({ nombre: '' }));
  }

  onCanchasChange(cancha: string, event: any) {
    this.selectedCanchas[cancha] = event.target.checked;
  }

  onSubmit() {
    const canchasSeleccionadas = Object.keys(this.selectedCanchas).filter(cancha => this.selectedCanchas[cancha]);
    const torneo = {
      nombre: this.nombreAmericano,
      fechaInicio: this.fechaInicio,
      cantidadParejas: this.cantidadParejas,
      canchas: canchasSeleccionadas,
      cantidadGrupos: this.cantidadGrupos
    };

    this.americanoService.nuevoAmericano(this.nombreAmericano, this.fechaInicio, this.cantidadGrupos)
      .pipe(
        catchError(error => {
          console.error('Error al crear el torneo', error);
          throw error;
        })
      )
      .subscribe(
        (response: any) => {
          if (response && response.id) {
            const americanoId = response.id;

            // Crear los grupos
            const gruposObservables = Array.from({ length: this.cantidadGrupos }, (_, i) => {
              const grupo: Grupo = {
                americano_fk: americanoId,
                nombreGrupo: `Grupo ${i + 1}`
              };
              return this.grupoService.crearGrupo(grupo);
            });

            forkJoin(gruposObservables)
              .pipe(
                catchError(error => {
                  console.error('Error al crear los grupos', error);
                  throw error;
                }),
                finalize(() => {
                  // Obtener los grupos creados
                  this.grupoService.obtenerGruposPorAmericano(americanoId).subscribe(
                    (grupos: Grupo[]) => {
                      console.log('Grupos obtenidos:', grupos); // Agregar esta línea para depuración
                      if (!grupos.length) {
                        console.error('No se encontraron grupos para asignar a las parejas');
                        return;
                      }

                      const parejasPorGrupo = Math.ceil(this.cantidadParejas / this.cantidadGrupos);
                      const parejasObservables = this.parejas.map((pareja, index) => {
                        const grupoIndex = Math.floor(index / parejasPorGrupo);
                        const grupo = grupos[grupoIndex];
                        if (!grupo || grupo.id === undefined) {
                          console.error('No se encontró el grupo para la pareja');
                          return;  // Maneja el caso donde el grupo no se encuentra
                        }
                        const grupoFk = grupo.id;
                        const nuevaPareja: Pareja = {
                          id: undefined,
                          nombre_pareja: pareja.nombre,
                          americano_fk: americanoId,
                          grupo_fk: grupoFk
                        };
                        return this.parejaService.nuevaPareja(nuevaPareja);
                      }).filter(Boolean);  // Filtra los valores undefined

                      forkJoin(parejasObservables)
                        .pipe(
                          finalize(() => {
                            this.router.navigate(['/americano', americanoId]);
                          })
                        )
                        .subscribe(
                          results => {
                            console.log('Todas las parejas fueron agregadas: ', results);
                          },
                          error => {
                            console.error('Error al agregar las parejas', error);
                          }
                        );
                    },
                    error => {
                      console.error('Error al obtener los grupos', error);
                    }
                  );
                })
              )
              .subscribe();
          } else {
            console.error('No se recibió una respuesta válida del backend');
          }
        }
      );
  }
}

