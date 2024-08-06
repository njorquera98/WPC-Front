import { Americano } from "./americano.model";
import { Cancha } from "./cancha.model";
import { Grupo } from "./grupo.model";
import { Pareja } from "./pareja.model";

export interface Partido {
  id?: number;
  resultadoPareja1?: number;
  resultadoPareja2?: number;
  fecha: Date;
  pareja1_fk: number;
  pareja2_fk: number;
  grupo_fk: number;
  americano_fk: number;
  cancha_fk?: number;

  pareja1?: Pareja;
  pareja2?: Pareja;
  grupo?: Grupo;
  americano?: Americano;
  cancha?: Cancha;

}


