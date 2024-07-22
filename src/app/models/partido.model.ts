export interface Partido {
  id?: number;
  resultadoPareja1?: number;
  resultadoPareja2?: number;
  fecha: Date;
  pareja1_fk: number;
  pareja2_fk: number;
  grupo_fk: number;
  americano_fk: number;
  cancha_fk: number;
}

