import { Component } from '@angular/core';
import { ParejaService } from '../services/pareja.service';
import { AmericanoService } from '../services/americano.service';
import { Pareja } from '../models/pareja.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent {
  nombreAmericano: string = '';
  cantidadParejas: number = 0;
  cantidadGrupos: number = 0;
  fechaInicio: string = '';
  parejas: { nombre: string }[] = [];
  canchas: string[] = ['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4'];
  selectedCanchas: { [key: string]: boolean } = {};

  constructor(private router: Router, private parejaService: ParejaService, private americanoService: AmericanoService) { }

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
    this.americanoService.nuevoAmericano(this.nombreAmericano, this.fechaInicio).subscribe(
      response => {
        console.log('Torneo creado exitosamente', response);
        const americanoId = response.id; // Obtén el ID del torneo creado

        // Crear las parejas con la referencia al torneo creado
        this.parejas.forEach(pareja => {
          const nuevaPareja: Pareja = { nombre_pareja: pareja.nombre, americano_fk: americanoId };
          this.parejaService.nuevaPareja(nuevaPareja).subscribe(
            response => {
              console.log('Pareja agregada: ', response);
              // Navegar al componente Americano pasando el id del torneo y la cantidad de grupos
              this.router.navigate(['/americano', { id: americanoId, grupos: this.cantidadGrupos, fechaInicio: this.fechaInicio }]);
            },
            error => {
              console.error('Error al agregar la pareja', error);
            }
          );
        });

      },
      error => {
        console.error('Error al crear el torneo', error);
      }
    );
  }
}
