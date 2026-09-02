import { generarPreguntas } from "./preguntas";
import type {
  Amistad,
  Curso,
  Idioma,
  Insignia,
  Leccion,
  Pregunta,
  Progreso,
  SolicitudAmistad,
  Usuario,
  UsuarioCurso,
  UsuarioInsignia,
  Vocabulario,
} from "./types";

export interface DB {
  usuarios: Usuario[];
  idiomas: Idioma[];
  cursos: Curso[];
  lecciones: Leccion[];
  preguntas: Pregunta[];
  vocabulario: Vocabulario[];
  progresos: Progreso[];
  insignias: Insignia[];
  usuario_cursos: UsuarioCurso[];
  usuario_insignias: UsuarioInsignia[];
  amigos: Amistad[];
  solicitudes: SolicitudAmistad[];
  usuario_actual: string | null;
}

export const HOY = new Date();

export function diaISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const dbInicial: DB = {
  usuarios: [],
  idiomas: [],
  cursos: [],
  lecciones: [],
  preguntas: [],
  vocabulario: [],
  progresos: [],
  insignias: [],
  usuario_cursos: [],
  usuario_insignias: [],
  amigos: [],
  solicitudes: [],
  usuario_actual: null,
};
