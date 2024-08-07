import { Grupo } from "./grupo.model";

export interface Pareja {
  id?: number;
  nombre_pareja: string;
  americano_fk?: number;
  grupo_fk?: number;
  grupo?: Grupo;
}
