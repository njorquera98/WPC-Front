import { Partido } from "./partido.model";

export interface Grupo {
  id: number;
  nombreGrupo: string;
  partidos: Partido[];
  americano_fk: number;
}
