import { Component, OnInit } from '@angular/core';
import { ParejaService } from '../services/pareja.service';
import { AmericanoService } from '../services/americano.service';
import { CanchaService } from '../services/cancha.service';
import { GrupoService } from '../services/grupo.service';
import { PartidoService } from '../services/partido.service';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Pareja } from '../models/pareja.model';
import { Grupo } from '../models/grupo.model';
import { Cancha } from '../models/cancha.model';
import { Partido } from '../models/partido.model';

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
  selectedCanchas: { [key: number]: boolean } = {};

  constructor(
    private router: Router,
    private parejaService: ParejaService,
    private americanoService: AmericanoService,
    private canchaService: CanchaService,
    private grupoService: GrupoService,
    private partidoService: PartidoService
  ) { }

  ngOnInit() {
    this.loadCanchas();
  }

  loadCanchas() {
    this.canchaService.getCanchas().subscribe(
      (canchas: Cancha[]) => {
        this.canchas = canchas;
        this.selectedCanchas = canchas.reduce((acc, cancha) => {
          if (cancha.id !== undefined) { // Asegúrate de que cancha.id no sea undefined
            acc[cancha.id] = false;
          }
          return acc;
        }, {} as { [key: number]: boolean });
      },
      error => {
        console.error('Error al cargar las canchas', error);
      }
    );
  }

  onCantidadParejasChange() {
    this.parejas = Array(this.cantidadParejas).fill({ nombre: '' }).map((_, i) => ({ nombre: '' }));
  }

  onCanchasChange(canchaId: number, event: any) {
    if (canchaId !== undefined) {
      this.selectedCanchas[canchaId] = event.target.checked;
    }
  }

  onSubmit() {
    const canchasSeleccionadas = Object.keys(this.selectedCanchas)
      .filter(canchaId => this.selectedCanchas[+canchaId]) // Asegúrate de convertir la clave a número
      .map(canchaId => +canchaId); // Convierte cada clave a número

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
                  this.grupoService.getGruposPorAmericano(americanoId).subscribe(
                    (grupos: Grupo[]) => {
                      console.log('Grupos obtenidos:', grupos);
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
                          return;
                        }
                        const grupoFk = grupo.id;
                        const nuevaPareja: Pareja = {
                          id: undefined,
                          nombre_pareja: pareja.nombre,
                          americano_fk: americanoId,
                          grupo_fk: grupoFk
                        };
                        console.log(`Asignando grupo_fk: ${grupoFk} a la pareja con nombre: ${pareja.nombre}`);
                        return this.parejaService.nuevaPareja(nuevaPareja);
                      }).filter(Boolean);

                      forkJoin(parejasObservables)
                        .pipe(
                          catchError(error => {
                            console.error('Error al agregar las parejas', error);
                            throw error;
                          }),
                          finalize(() => {
                            this.crearPartidos(americanoId, grupos, canchasSeleccionadas);
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

  asignarParejasAGrupos(parejas: Pareja[], grupos: Grupo[]): Pareja[] {
    // Mezclar aleatoriamente las parejas
    const parejasAleatorias = parejas.sort(() => Math.random() - 0.5);

    // Asignar aleatoriamente a los grupos
    let grupoIndex = 0;
    parejasAleatorias.forEach(pareja => {
      pareja.grupo_fk = grupos[grupoIndex].id;
      console.log(`Asignando grupo_fk: ${pareja.grupo_fk} a la pareja con nombre: ${pareja.nombre_pareja}`);
      grupoIndex = (grupoIndex + 1) % grupos.length;
    });

    console.log('Todas las parejas fueron agregadas: ', parejasAleatorias);
    return parejasAleatorias;
  }

  crearPartidos(americanoId: number, grupos: Grupo[], canchasSeleccionadas: number[]) {
    this.parejaService.obtenerParejasPorAmericano(americanoId).subscribe(
      (parejas: Pareja[]) => {
        console.log('Parejas en el torneo:', parejas);

        // Asignar los grupos a las parejas
        const parejasConGrupos = this.asignarParejasAGrupos(parejas, grupos);

        // Inicializar la lista de observables para los partidos
        const partidosObservables: Observable<any>[] = [];
        let canchaIndex = 0;

        // Iterar sobre cada grupo
        grupos.forEach(grupo => {
          // Filtrar las parejas que pertenecen al grupo actual
          const parejasEnGrupo = parejasConGrupos.filter(pareja => pareja.grupo_fk === grupo.id);
          console.log(`Parejas en grupo ${grupo.id}: `, parejasEnGrupo);

          // Verificar que haya suficientes parejas para crear partidos
          if (parejasEnGrupo.length < 2) {
            console.warn(`El grupo ${grupo.id} no tiene suficientes parejas para crear partidos.`);
            return;
          }

          // Crear partidos entre todas las combinaciones de parejas en el grupo
          for (let i = 0; i < parejasEnGrupo.length; i++) {
            for (let j = i + 1; j < parejasEnGrupo.length; j++) {
              const canchaSeleccionada = canchasSeleccionadas[canchaIndex];

              // Verificar que haya una cancha seleccionada
              if (canchaSeleccionada === undefined) {
                console.error('No hay cancha seleccionada disponible');
                continue;
              }

              // Crear el objeto partido
              const partido: Partido = {
                id: undefined,
                resultadoPareja1: 0,
                resultadoPareja2: 0,
                fecha: new Date(this.fechaInicio),
                pareja1_fk: parejasEnGrupo[i].id!,
                pareja2_fk: parejasEnGrupo[j].id!,
                grupo_fk: grupo.id!,
                americano_fk: americanoId,
                cancha_fk: canchaSeleccionada  // Usa el ID de la cancha seleccionada
              };

              console.log('Creando partido:', partido);

              // Agregar el observable para la creación del partido
              partidosObservables.push(this.partidoService.crearPartido(partido));

              // Avanzar al siguiente índice de cancha
              canchaIndex = (canchaIndex + 1) % canchasSeleccionadas.length;
            }
          }
        });

        // Verificar que se han creado observables para todos los partidos
        if (partidosObservables.length === 0) {
          console.error('No se han encontrado parejas en los grupos para crear partidos');
          return;
        }

        // Realizar todas las peticiones para crear los partidos en paralelo
        forkJoin(partidosObservables)
          .pipe(
            catchError(error => {
              console.error('Error al crear los partidos', error);
              throw error;
            }),
            finalize(() => {
              console.log('Todos los partidos han sido creados');
              this.router.navigate(['/americano', americanoId]);
            })
          )
          .subscribe(
            results => {
              console.log('Resultados de la creación de partidos: ', results);
            },
            error => {
              console.error('Error en la creación de partidos', error);
            }
          );
      },
      error => {
        console.error('Error al obtener las parejas del torneo', error);
      }
    );
  }
}

