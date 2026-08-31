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
  | { tipo: "xp"; valor: number }
  | { tipo: "racha"; valor: number }
  | { tipo: "lecciones_completadas"; valor: number };

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  criterio: CriterioInsignia;
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
export type TipoPregunta = "opcion" | "match" | "escritura";

export interface ParMatch {
  es: string; // palabra en español
  tr: string; // traducción en el idioma del curso
}

export interface Pregunta {
  id: string;
  leccion_id: string;
  tipo: TipoPregunta;
  enunciado: string;
  opciones?: string[]; // tipo "opcion"
  correcta?: number; // índice de la opción correcta (tipo "opcion")
  pares?: ParMatch[]; // tipo "match"
  respuesta?: string; // tipo "escritura"
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
