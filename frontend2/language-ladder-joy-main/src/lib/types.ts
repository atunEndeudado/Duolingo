// Modelo de dominio (Proyecto 6 — Duolingo)

export type Nivel = "A1" | "A2" | "B1" | "B2" | "C1";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  xp_total: number;
  racha_dias: number;
  fecha_ultima_actividad: string | null; // ISO
  premium: boolean;
  es_admin: boolean;
}

export interface Idioma {
  id: string;
  nombre: string;
  codigo: string;
}

export interface Curso {
  id: string;
  idioma_id: string;
  nivel: Nivel;
}

export interface Leccion {
  id: string;
  curso_id: string;
  orden: number;
  titulo: string;
  xp_recompensa: number; // 5..50
  bloqueada?: boolean;
}

export interface Vocabulario {
  id: string;
  palabra: string;
  traduccion: string;
  nivel: Nivel;
  idioma_id: string;
}

export interface Progreso {
  id: string;
  usuario_id: string;
  leccion_id: string;
  puntaje: number; // 0..100
  completada: boolean;
  fecha: string; // ISO
}

export type CriterioInsignia =
  | { variable: "racha"; valor: number }
  | { variable: "cantidad_amigos"; valor: number }
  | { variable: "xp_total"; valor: number }
  | { variable: "xp_dia"; valor: number };

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  criterio?: CriterioInsignia;
  icono: string;
}

export interface UsuarioCurso {
  usuario_id: string;
  curso_id: string;
  fecha_inscripcion: string;
}

export interface UsuarioInsignia {
  usuario_id: string;
  insignia_id: string;
  fecha: string;
}

export interface Amistad {
  usuario_a: string;
  usuario_b: string;
  fecha: string;
}

// ---- Vistas / DTOs de respuesta ----

export interface ProgresoCurso {
  curso_id: string;
  total_lecciones: number;
  completadas: number;
  porcentaje: number;
  proxima_leccion: Leccion | null;
}

export interface FilaRanking {
  posicion: number;
  usuario_id: string;
  nombre: string;
  xp: number;
  racha_dias: number;
  es_yo: boolean;
}

export interface DiaActividad {
  fecha: string; // YYYY-MM-DD
  xp: number;
  lecciones_completadas: number;
}

// ---- Preguntas de lección (HU4) ----

/**
 * Tipos de ejercicio:
 * - "opcion":    multiple choice con 4 opciones para traducir una palabra
 * - "match":     5 palabras a la izquierda y sus 5 traducciones desordenadas a la derecha
 * - "escritura": se escribe la traducción con el teclado
 */
export type TipoPregunta = "opcion" | "match" | "escritura" | "oracion";
export type DireccionPregunta = "nativo_a_curso" | "curso_a_nativo";

export interface ParMatch {
  es: string; // palabra en español
  tr: string; // traducción en el idioma del curso
}

export interface Pregunta {
  id: string;
  leccion_id: string;
  orden: number;
  tipo: TipoPregunta;
  direccion?: DireccionPregunta;
  enunciado: string;
  pregunta: string;
  es_premium: boolean;
  opciones?: string[] | undefined; // tipo "opcion"
  correcta?: number | undefined; // índice de la opción correcta (tipo "opcion")
  pares?: ParMatch[] | undefined; // tipo "match"
  respuesta?: string | undefined; // tipo "escritura"
  palabras?: string[] | undefined; // tipo "oracion"
  premium: boolean; // solo disponible con suscripción Premium
}


// ---- Solicitudes de amistad (HU8) ----

export type EstadoSolicitud = "pendiente" | "aceptada" | "rechazada";

export interface SolicitudAmistad {
  id: string;
  de: string; // usuario que envía
  para: string; // usuario que recibe
  estado: EstadoSolicitud;
  fecha: string;
}
