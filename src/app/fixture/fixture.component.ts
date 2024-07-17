import { Component, OnInit } from '@angular/core';
import { ParejaService } from '../services/pareja.service';
import { AmericanoService } from '../services/americano.service';
import { CanchaService } from '../services/cancha.service';
import { Pareja } from '../models/pareja.model';
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
    private canchaService: CanchaService
  ) { }

  ngOnInit() {
    this.loadCanchas();
  }

  loadCanchas() {
    this.canchaService.getCanchas().subscribe(
      (canchas: Cancha[]) => {
        this.canchas = canchas;
        // Inicializa selectedCanchas con false para cada cancha
        canchas.forEach(cancha => this.selectedCanchas[cancha.numeroCancha] = false);
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

    // Crear el torneo primero
    this.americanoService.nuevoAmericano(this.nombreAmericano, this.fechaInicio, this.cantidadGrupos)
      .pipe(
        catchError(error => {
          console.error('Error al crear el torneo', error);
          throw error; // Propaga el error
        })
      )
      .subscribe(
        (response: any) => {
          console.log('Respuesta del backend:', response); // Verifica la respuesta del backend

          if (response && response.id) {
            const americanoId = response.id; // Obtén el ID del torneo creado

            // Crear las parejas con la referencia al torneo creado
            const parejasObservables = this.parejas.map(pareja => {
              const nuevaPareja: Pareja = {
                id: undefined, // Deja 'id' indefinido para que lo genere el backend
                nombre_pareja: pareja.nombre,
                americano_fk: americanoId
              };
              return this.parejaService.nuevaPareja(nuevaPareja);
            });

            // Usar forkJoin para esperar a que todas las parejas sean creadas
            forkJoin(parejasObservables)
              .pipe(
                finalize(() => {
                  // Navegar al componente Americano pasando solo el id del torneo
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
          } else {
            console.error('No se recibió una respuesta válida del backend');
          }
        }
      );
  }
}

