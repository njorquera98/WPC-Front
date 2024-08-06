import { Pareja } from "./pareja.model";
import { Partido } from "./partido.model";

export interface Grupo {
  id?: number;
  nombreGrupo: string;
  americano_fk: number;
  parejas?: Pareja[];
  partidos?: Partido[];
}
