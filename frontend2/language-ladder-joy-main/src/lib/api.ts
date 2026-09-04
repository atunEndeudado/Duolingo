import { diaISO, type DB } from "./mock-db";
import type {
  Curso,
  DiaActividad,
  FilaRanking,
  Idioma,
  Insignia,
  Leccion,
  Nivel,
  Pregunta,
  ProgresoCurso,
  SolicitudAmistad,
  Usuario,
  Vocabulario,
  DireccionPregunta,
} from "./types";

const API_URL = import.meta.env['VITE_API_URL'] ?? "http://127.0.0.1:8020/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = res.statusText || "Error de la API";
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (Array.isArray(data?.detail)) message = data.detail.map((d: any) => d.msg ?? d).join(", ");
      else if (data?.detail) message = String(data.detail);
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const asStringId = (value: number | string | null | undefined): string => String(value ?? "");

export function mapBackendUsuario(u: any): Usuario {
  return {
    id: asStringId(u.id),
    email: String(u.email ?? ""),
    nombre: String(u.nombre ?? ""),
    xp_total: Number(u.xp_total ?? 0),
    racha_dias: Number(u.racha_dias ?? 0),
    fecha_ultima_actividad: u.fecha_ultima_actividad ? String(u.fecha_ultima_actividad) : null,
    premium: Boolean(u.es_premium ?? u.premium ?? false),
    es_admin: Boolean(u.es_admin ?? false),
  };
}

export function mapBackendIdioma(i: any): Idioma {
  return { id: asStringId(i.id), nombre: String(i.nombre ?? ""), codigo: String(i.codigo ?? "") };
}

export function mapBackendCurso(c: any): Curso {
  return { id: asStringId(c.id), idioma_id: asStringId(c.idioma_id), nivel: c.nivel as Nivel };
}

export function mapBackendLeccion(l: any): Leccion {
  return {
    id: asStringId(l.id),
    curso_id: asStringId(l.curso_id),
    orden: Number(l.orden ?? 1),
    titulo: String(l.titulo ?? ""),
    xp_recompensa: Number(l.xp_recompensa ?? 0),
    bloqueada: Boolean(l.bloqueada ?? false),
  };
}

export function mapBackendInsignia(i: any): Insignia {
  return {
    id: asStringId(i.id),
    nombre: String(i.nombre ?? ""),
    descripcion: String(i.descripcion ?? ""),
    icono: String(i.icono ?? "🏅"),
  };
}

export function mapBackendUsuarioInsignia(i: any) {
  return {
    usuario_id: asStringId(i.usuario_id),
    insignia_id: asStringId(i.insignia_id),
    fecha: String(i.fecha ?? ""),
  };
}

export function mapBackendProgreso(p: any): Progreso {
  return {
    id: asStringId(p.id),
    usuario_id: asStringId(p.usuario_id),
    leccion_id: asStringId(p.leccion_id),
    puntaje: Number(p.puntaje ?? 0),
    completada: Boolean(p.completada),
    fecha: String(p.fecha ?? ""),
  };
}

export function mapBackendPregunta(p: any): Pregunta {
  const tipoBackend = String(p.tipo ?? "traducir");
  const direccion = (p.direccion === "curso_a_nativo" ? "curso_a_nativo" : "nativo_a_curso") as DireccionPregunta;
  const respuesta = String(p.respuesta ?? "");
  const pregunta = String(p.pregunta ?? "");
  const separar = (texto: string) => texto.split(/[,;|\n]+/).map((item) => item.trim()).filter(Boolean);
  const palabrasPregunta = separar(pregunta);
  const palabrasRespuesta = separar(respuesta);
  const paresGenerados = tipoBackend === "unir_palabras" && palabrasPregunta.length === palabrasRespuesta.length
    ? palabrasPregunta.map((es, index) => ({ es, tr: palabrasRespuesta[index]! }))
    : undefined;
  const paresBackend = Array.isArray(p.pares) ? p.pares : undefined;
  const palabrasGeneradas = tipoBackend === "unir_oraciones" ? respuesta.split(/\s+/).filter(Boolean) : undefined;
  return {
    id: asStringId(p.id),
    leccion_id: asStringId(p.leccion_id),
    orden: Number(p.orden ?? 1),
    pregunta,
    respuesta,
    es_premium: Boolean(p.es_premium ?? false),
    tipo: tipoBackend === "traducir" ? "escritura" : tipoBackend === "unir_oraciones" ? "oracion" : "match",
    direccion,
    enunciado: String(p.enunciado ?? pregunta),
    ...(paresBackend ?? paresGenerados ? { pares: paresBackend ?? paresGenerados } : {}),
    ...(palabrasGeneradas ? { palabras: palabrasGeneradas } : {}),
    premium: Boolean(p.es_premium ?? false)
  };
}

export function mapBackendVocabulario(v: any): Vocabulario {
  return {
    id: asStringId(v.id),
    palabra: String(v.palabra ?? ""),
    traduccion: String(v.traduccion ?? ""),
    nivel: v.nivel as Nivel,
    ...(v.idioma_id != null ? { idioma_id: asStringId(v.idioma_id) } : {}),
  };
}

export async function listarIdiomas(): Promise<Idioma[]> {
  const data = await request<any[]>("/idiomas");
  return (data ?? []).map(mapBackendIdioma);
}

export async function crearIdiomaBackend(body: { nombre: string; codigo: string }) {
  const data = await request<any>(`/idiomas/`, {
    method: "POST",
    body: JSON.stringify({ nombre: body.nombre, codigo: body.codigo }),
  });
  return mapBackendIdioma(data);
}

export async function eliminarIdiomaApi(idiomaId: number): Promise<void> {
  const res = await fetch(`${API_URL}/idiomas/${idiomaId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al eliminar el idioma");
  }
}

export async function listarCursosPorIdioma(idiomaId: string): Promise<Curso[]> {
  const data = await request<any[]>(`/cursos/idioma/${idiomaId}`);
  return (data ?? []).map(mapBackendCurso);
}

export async function inscribirseBackend(usuarioId: string, cursoId: string) {
  const data = await request<any>("/inscripciones/", {
    method: "POST",
    body: JSON.stringify({ usuario_id: Number(usuarioId), curso_id: Number(cursoId) }),
  });
  return {
    usuario_id: asStringId(data.usuario_id),
    curso_id: asStringId(data.curso_id),
    fecha_inscripcion: String(data.fecha_inscripcion ?? ""),
  };
}

export async function listarInscripcionesUsuarioBackend(usuarioId: string) {
  const data = await request<any[]>(`/inscripciones/usuario/${usuarioId}`);
  return (data ?? []).map((item) => ({
    usuario_id: asStringId(item.usuario_id),
    curso_id: asStringId(item.curso_id),
    fecha_inscripcion: String(item.fecha_inscripcion ?? ""),
  }));
}

export async function listarLeccionesPorCurso(cursoId: string, usuarioId?: string): Promise<Leccion[]> {
  const query = usuarioId ? `?usuario_id=${encodeURIComponent(usuarioId)}` : "";
  const data = await request<any[]>(`/lecciones/curso/${cursoId}${query}`);
  return (data ?? []).map(mapBackendLeccion);
}

export async function listarInsigniasBackend(): Promise<Insignia[]> {
  const data = await request<any[]>("/insignias/");
  return (data ?? []).map(mapBackendInsignia);
}

export async function crearInsigniaBackend(body: {
  nombre: string;
  descripcion?: string;
  variable: "racha" | "cantidad_amigos" | "xp_total" | "xp_dia";
  valor: number;
}) {
  const data = await request<any>("/insignias/", {
    method: "POST",
    body: JSON.stringify({
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      criterio: { variable: body.variable, valor: body.valor },
    }),
  });
  return mapBackendInsignia(data);
}

export async function eliminarInsignia(insigniaId: number | string): Promise<void> {
  await request<void>(`/insignias/${insigniaId}`, { method: "DELETE" });
}

export async function listarInsigniasUsuarioBackend(usuarioId: string) {
  const data = await request<any[]>(`/usuario-insignias/usuario/${usuarioId}`);
  return (data ?? []).map(mapBackendUsuarioInsignia);
}

import { AuthService } from "@/services/authService"; // o la ubicación de tu AuthService

export async function activarPremiumManualApi(usuarioId: number | string): Promise<void> {
  const token = AuthService.getToken(); // O localStorage.getItem("token")
  
  const response = await fetch(`http://localhost:8000/usuarios/${usuarioId}/activar-premium`, {
    method: "POST", // O PUT según tu endpoint en FastAPI
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ⚠️ Esencial si FastAPI requiere autenticación
    },
  });

  if (!response.ok) {
    throw new Error("Error al activar Premium en el backend");
  }
}
export async function crearUsuarioBackend(body: { email: string; nombre: string; password: string }) {
  const data = await request<any>(`/usuarios/`, {
    method: "POST",
    body: JSON.stringify({
      email: body.email,
      nombre: body.nombre,
      password: body.password,
      es_premium: false,
    }),
  });
  return mapBackendUsuario(data);
}

export async function crearCursoBackend(body: { idioma_id: string; nivel: Nivel }) {
  const data = await request<any>(`/cursos/`, {
    method: "POST",
    body: JSON.stringify({ idioma_id: Number(body.idioma_id), nivel: body.nivel }),
  });
  return mapBackendCurso(data);
}

export async function eliminarCurso(cursoId: string): Promise<void> {
  await request<void>(`/cursos/${cursoId}`, { method: "DELETE" });
}

export async function crearLeccionBackend(body: { curso_id: string; orden: number; titulo: string; xp_recompensa: number }) {
  const data = await request<any>(`/lecciones/`, {
    method: "POST",
    body: JSON.stringify({
      curso_id: Number(body.curso_id),
      orden: body.orden,
      titulo: body.titulo,
      xp_recompensa: body.xp_recompensa,
    }),
  });
  return mapBackendLeccion(data);
}

export async function obtenerUsuarioBackend(usuarioId: string) {
  const data = await request<any>(`/usuarios/${usuarioId}`);
  return mapBackendUsuario(data);
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); // O "auth_token" / "jwt" según cómo lo guardes
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
}
export async function listarUsuariosBackend() {
  const data = await request<any[]>(`/usuarios/`);
  return (data ?? []).map(mapBackendUsuario);
}

export async function buscarUsuariosBackend(query: string): Promise<Usuario[]> {
  const data = await request<any[]>(`/usuarios/buscar?q=${encodeURIComponent(query)}&limit=20`);
  return (data ?? []).map(mapBackendUsuario);
}

export async function obtenerSugerenciasBackend(usuarioId: string): Promise<Usuario[]> {
  const data = await request<any[]>(`/usuarios/sugerencias?usuario_id=${encodeURIComponent(usuarioId)}&limit=20`);
  return (data ?? []).map(mapBackendUsuario);
}

/**
 * Capa de acceso a datos.
 *
 * Hoy trabaja contra un store en memoria (mock). Cada función deja comentado el
 * endpoint REST que le corresponde, listo para reemplazar la implementación mock
 * por un `fetch` real.
 *
 * const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8010";
 */

export const NIVELES: Nivel[] = ["A1", "A2", "B1", "B2", "C1"];

export type Resultado<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const ok = <T,>(data: T): Resultado<T> => ({ ok: true, data });
const err = (status: number, error: string): Resultado<never> => ({ ok: false, status, error });

let seq = 1000;
const nextId = (p: string) => `${p}-${++seq}`;

/* ------------------------------------------------------------------ *
 * HU1 — Registro
 * POST /usuarios  -> 201 { usuario }
 *
 * export async function crearUsuario(body: { email: string; nombre: string }) {
 *   const res = await fetch(`${API_URL}/usuarios`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(body),
 *   });
 *   if (res.status === 409) throw new Error("El email ya está registrado");
 *   return (await res.json()) as Usuario;
 * }
 * ------------------------------------------------------------------ */
export function crearUsuario(
  db: DB,
  body: { email: string; nombre: string },
): Resultado<{ db: DB; usuario: Usuario }> {
  const email = body.email.trim().toLowerCase();
  if (!email || !body.nombre.trim()) return err(400, "Nombre y email son obligatorios");
  if (db.usuarios.some((u) => u.email.toLowerCase() === email))
    return err(409, "El email ya está registrado");

  const usuario: Usuario = {
    id: nextId("u"),
    email,
    nombre: body.nombre.trim(),
    xp_total: 0,
    racha_dias: 0,
    fecha_ultima_actividad: null,
    premium: false,
    es_admin: false,
  };
  return ok({ db: { ...db, usuarios: [...db.usuarios, usuario], usuario_actual: usuario.id }, usuario });
}

/* ------------------------------------------------------------------ *
 * HU2 — Inscribirse a un curso
 * POST /usuarios/{id}/cursos  { curso_id }
 * GET  /usuarios/{id}/cursos
 * ------------------------------------------------------------------ */
export function inscribirse(db: DB, usuario_id: string, curso_id: string): Resultado<{ db: DB }> {
  if (!db.cursos.some((c) => c.id === curso_id)) return err(404, "Curso inexistente");
  if (db.usuario_cursos.some((uc) => uc.usuario_id === usuario_id && uc.curso_id === curso_id))
    return err(409, "Ya estás inscripto a este curso");

  return ok({
    db: {
      ...db,
      usuario_cursos: [
        ...db.usuario_cursos,
        { usuario_id, curso_id, fecha_inscripcion: new Date().toISOString() },
      ],
    },
  });
}

export function cursosDeUsuario(db: DB, usuario_id: string) {
  return db.usuario_cursos
    .filter((uc) => uc.usuario_id === usuario_id)
    .map((uc) => ({
      inscripcion: uc,
      curso: db.cursos.find((c) => c.id === uc.curso_id)!,
    }))
    .filter((x) => Boolean(x.curso));
}

export function idiomaDeCurso(db: DB, curso_id: string) {
  const curso = db.cursos.find((c) => c.id === curso_id);
  return curso ? db.idiomas.find((i) => i.id === curso.idioma_id) : undefined;
}

/* ------------------------------------------------------------------ *
 * HU3 — Alta de contenido (admin)
 * POST /cursos                    { idioma_id, nivel }
 * POST /cursos/{id}/lecciones     { orden, titulo, xp_recompensa }
 * GET  /cursos/{id}/lecciones     -> ordenadas por `orden`
 * ------------------------------------------------------------------ */
export function crearCurso(db: DB, body: { idioma_id: string; nivel: Nivel }): Resultado<{ db: DB }> {
  if (!db.idiomas.some((i) => i.id === body.idioma_id)) return err(404, "Idioma inexistente");
  if (!NIVELES.includes(body.nivel)) return err(422, "Nivel inválido");
  if (db.cursos.some((c) => c.idioma_id === body.idioma_id && c.nivel === body.nivel))
    return err(409, "Ese curso ya existe");

  return ok({ db: { ...db, cursos: [...db.cursos, { id: nextId("c"), ...body }] } });
}

export function crearLeccion(
  db: DB,
  body: { curso_id: string; orden: number; titulo: string; xp_recompensa: number },
): Resultado<{ db: DB }> {
  if (!db.cursos.some((c) => c.id === body.curso_id)) return err(404, "Curso inexistente");
  if (!body.titulo.trim()) return err(422, "El título es obligatorio");
  if (body.xp_recompensa < 5 || body.xp_recompensa > 50)
    return err(422, "xp_recompensa debe estar entre 5 y 50");
  if (body.orden < 1) return err(422, "El orden debe ser mayor a 0");
  if (db.lecciones.some((l) => l.curso_id === body.curso_id && l.orden === body.orden))
    return err(409, `Ya existe una lección con orden ${body.orden} en este curso`);

  return ok({
    db: { ...db, lecciones: [...db.lecciones, { id: nextId("l"), ...body, titulo: body.titulo.trim() }] },
  });
}

export function leccionesDeCurso(db: DB, curso_id: string): Leccion[] {
  return db.lecciones.filter((l) => l.curso_id === curso_id).sort((a, b) => a.orden - b.orden);
}

/* ------------------------------------------------------------------ *
 * HU5 — Progreso secuencial
 * (validado en el backend al iniciar/completar la lección)
 * ------------------------------------------------------------------ */
export function leccionCompletada(db: DB, usuario_id: string, leccion_id: string) {
  return db.progresos.some(
    (p) => p.usuario_id === usuario_id && p.leccion_id === leccion_id && p.completada,
  );
}

export function puedeIniciar(db: DB, usuario_id: string, leccion: Leccion): boolean {
  if (leccion.orden === 1) return true;
  const anterior = db.lecciones.find(
    (l) => l.curso_id === leccion.curso_id && l.orden === leccion.orden - 1,
  );
  if (!anterior) return true;
  return leccionCompletada(db, usuario_id, anterior.id);
}

/* ------------------------------------------------------------------ *
 * HU4 + HU6 + HU7 — Completar lección (suma XP, actualiza racha, otorga insignias)
 * POST /lecciones/{id}/completar  { usuario_id, puntaje } -> 201 { progreso, xp_ganado, insignias_nuevas }
 * ------------------------------------------------------------------ */
export function completarLeccion(
  db: DB,
  usuario_id: string,
  leccion_id: string,
  puntaje: number,
): Resultado<{ db: DB; completada: boolean; xp_ganado: number; insignias_nuevas: Insignia[] }> {
  const leccion = db.lecciones.find((l) => l.id === leccion_id);
  if (!leccion) return err(404, "Lección inexistente");
  const usuario = db.usuarios.find((u) => u.id === usuario_id);
  if (!usuario) return err(404, "Usuario inexistente");
  if (!db.usuario_cursos.some((uc) => uc.usuario_id === usuario_id && uc.curso_id === leccion.curso_id))
    return err(404, "No estás inscripto a este curso");
  if (puntaje < 0 || puntaje > 100) return err(422, "El puntaje debe estar entre 0 y 100");
  if (!puedeIniciar(db, usuario_id, leccion))
    return err(409, "Debés completar la lección anterior primero");

  const ahora = new Date();
  const completada = puntaje >= 60;
  const yaEstaba = leccionCompletada(db, usuario_id, leccion_id);
  const xp_ganado = completada && !yaEstaba ? leccion.xp_recompensa : 0;

  const progresos = [
    ...db.progresos,
    {
      id: nextId("p"),
      usuario_id,
      leccion_id,
      puntaje,
      completada,
      fecha: ahora.toISOString(),
    },
  ];

  // HU6 — racha diaria
  let racha_dias = usuario.racha_dias;
  let fecha_ultima_actividad = usuario.fecha_ultima_actividad;
  if (completada) {
    const hoy = diaISO(ahora);
    const ultimo = fecha_ultima_actividad ? diaISO(new Date(fecha_ultima_actividad)) : null;
    if (ultimo !== hoy) {
      const ayer = new Date(ahora);
      ayer.setDate(ayer.getDate() - 1);
      racha_dias = ultimo === diaISO(ayer) ? racha_dias + 1 : 1;
      fecha_ultima_actividad = ahora.toISOString();
    }
  }

  const actualizado: Usuario = {
    ...usuario,
    xp_total: usuario.xp_total + xp_ganado,
    racha_dias,
    fecha_ultima_actividad,
  };

  let nuevaDb: DB = {
    ...db,
    progresos,
    usuarios: db.usuarios.map((u) => (u.id === usuario_id ? actualizado : u)),
  };

  const { db: dbConInsignias, nuevas } = evaluarInsignias(nuevaDb, usuario_id);
  nuevaDb = dbConInsignias;

  return ok({ db: nuevaDb, completada, xp_ganado, insignias_nuevas: nuevas });
}

/* ------------------------------------------------------------------ *
 * Preguntas de la lección
 * GET /lecciones/{id}/preguntas
 * (el backend devuelve las premium solo si el usuario tiene suscripción)
 * ------------------------------------------------------------------ */
export function preguntasDeLeccion(db: DB, leccion_id: string, incluirPremium: boolean): Pregunta[] {
  return db.preguntas.filter((q) => q.leccion_id === leccion_id && (incluirPremium || !q.premium));
}

export function preguntasPremiumDeLeccion(db: DB, leccion_id: string): number {
  return db.preguntas.filter((q) => q.leccion_id === leccion_id && q.premium).length;
}

/* ------------------------------------------------------------------ *
 * Premium — pago simulado
 * POST /usuarios/{id}/suscripcion  { plan } -> 201 { usuario }
 * DELETE /usuarios/{id}/suscripcion
 * ------------------------------------------------------------------ */
export function activarPremium(db: DB, usuario_id: string): Resultado<{ db: DB }> {
  const u = db.usuarios.find((x) => x.id === usuario_id);
  if (!u) return err(404, "Usuario inexistente");
  if (u.premium) return err(409, "Ya tenés Premium activo");
  return ok({
    db: { ...db, usuarios: db.usuarios.map((x) => (x.id === usuario_id ? { ...x, premium: true } : x)) },
  });
}

export function cancelarPremium(db: DB, usuario_id: string): DB {
  return {
    ...db,
    usuarios: db.usuarios.map((x) => (x.id === usuario_id ? { ...x, premium: false } : x)),
  };
}

/* ------------------------------------------------------------------ *
 * HU7 — Insignias
 * GET /usuarios/{id}/insignias
 * ------------------------------------------------------------------ */
export function cumpleCriterio(db: DB, usuario_id: string, insignia: Insignia): boolean {
  const u = db.usuarios.find((x) => x.id === usuario_id);
  if (!u || !insignia.criterio) return false;
  const { criterio } = insignia;
  if (criterio.variable === "xp_total") return u.xp_total >= criterio.valor;
  if (criterio.variable === "racha") return u.racha_dias >= criterio.valor;
  if (criterio.variable === "cantidad_amigos") {
    return new Set(
      db.amigos
        .filter((a) => a.usuario_a === usuario_id || a.usuario_b === usuario_id)
        .map((a) => (a.usuario_a === usuario_id ? a.usuario_b : a.usuario_a)),
    ).size >= criterio.valor;
  }
  const hoy = diaISO(new Date());
  const xpDia = db.progresos
    .filter((p) => p.usuario_id === usuario_id && p.completada && diaISO(new Date(p.fecha)) === hoy)
    .reduce((total, p) => total + (db.lecciones.find((l) => l.id === p.leccion_id)?.xp_recompensa ?? 0), 0);
  return xpDia >= criterio.valor;
}

export function totalLeccionesCompletadas(db: DB, usuario_id: string): number {
  const ids = new Set(
    db.progresos.filter((p) => p.usuario_id === usuario_id && p.completada).map((p) => p.leccion_id),
  );
  return ids.size;
}

function evaluarInsignias(db: DB, usuario_id: string): { db: DB; nuevas: Insignia[] } {
  const nuevas: Insignia[] = [];
  const otorgadas = new Set(
    db.usuario_insignias.filter((ui) => ui.usuario_id === usuario_id).map((ui) => ui.insignia_id),
  );
  for (const insignia of db.insignias) {
    if (otorgadas.has(insignia.id)) continue; // una sola vez por usuario
    if (!insignia.criterio) continue;
    if (cumpleCriterio(db, usuario_id, insignia)) nuevas.push(insignia);
  }
  if (nuevas.length === 0) return { db, nuevas };
  const fecha = new Date().toISOString();
  return {
    db: {
      ...db,
      usuario_insignias: [
        ...db.usuario_insignias,
        ...nuevas.map((i) => ({ usuario_id, insignia_id: i.id, fecha })),
      ],
    },
    nuevas,
  };
}

export function insigniasDeUsuario(db: DB, usuario_id: string) {
  return db.insignias.map((insignia) => {
    const ui = db.usuario_insignias.find(
      (x) => x.usuario_id === usuario_id && x.insignia_id === insignia.id,
    );
    return { insignia, desbloqueada: Boolean(ui), fecha: ui?.fecha ?? null };
  });
}

/* ------------------------------------------------------------------ *
 * HU8 — Amigos con solicitud
 * POST /usuarios/{id}/solicitudes           { amigo_id }        -> 201
 * GET  /usuarios/{id}/solicitudes?estado=pendiente
 * PATCH /solicitudes/{id}                   { estado: aceptada | rechazada }
 * GET  /usuarios/{id}/amigos
 * DELETE /usuarios/{id}/amigos/{amigo_id}
 * ------------------------------------------------------------------ */
export function sonAmigos(db: DB, a: string, b: string): boolean {
  return db.amigos.some(
    (x) => (x.usuario_a === a && x.usuario_b === b) || (x.usuario_a === b && x.usuario_b === a),
  );
}

export function solicitudPendiente(db: DB, a: string, b: string): SolicitudAmistad | undefined {
  return db.solicitudes.find(
    (s) =>
      s.estado === "pendiente" &&
      ((s.de === a && s.para === b) || (s.de === b && s.para === a)),
  );
}

/** El usuario envía la solicitud; el otro perfil decide si la acepta. */
export function enviarSolicitud(
  db: DB,
  usuario_id: string,
  amigo_id: string,
): Resultado<{ db: DB }> {
  if (usuario_id === amigo_id) return err(422, "No podés enviarte una solicitud a vos mismo");
  if (!db.usuarios.some((u) => u.id === amigo_id)) return err(404, "Usuario inexistente");
  if (sonAmigos(db, usuario_id, amigo_id)) return err(409, "Ya son amigos");
  if (solicitudPendiente(db, usuario_id, amigo_id)) return err(409, "Ya hay una solicitud pendiente");

  const solicitud: SolicitudAmistad = {
    id: nextId("s"),
    de: usuario_id,
    para: amigo_id,
    estado: "pendiente",
    fecha: new Date().toISOString(),
  };
  return ok({ db: { ...db, solicitudes: [...db.solicitudes, solicitud] } });
}
export async function listarSolicitudesPendientesApi(
  usuario_id: number | string
): Promise<SolicitudAmistad[]> {
  const res = await fetch(`${API_URL}/amistad/solicitudes/pendientes/${usuario_id}`);

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export async function enviarSolicitudAmistad(
  usuario_solicitante: number | string,
  usuario_receptor: number | string
): Promise<SolicitudAmistad> {
  const res = await fetch(`${API_URL}/amistad/solicitudes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_solicitante: Number(usuario_solicitante),
      usuario_receptor: Number(usuario_receptor),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al enviar la solicitud de amistad");
  }

  return res.json();
}
/** El destinatario acepta o rechaza. La amistad solo se crea si acepta. */
export async function responderSolicitud(
  solicitud_id: number | string,
  acepta: boolean
): Promise<SolicitudAmistad> {
  const estado = acepta ? "aceptada" : "rechazada";

  const res = await fetch(`${API_URL}/amistad/solicitudes/${solicitud_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al responder la solicitud");
  }

  return res.json();
}

export function cancelarSolicitud(db: DB, solicitud_id: string): DB {
  return { ...db, solicitudes: db.solicitudes.filter((s) => s.id !== solicitud_id) };
}

export function solicitudesRecibidas(db: DB, usuario_id: string) {
  return db.solicitudes
    .filter((s) => s.para === usuario_id && s.estado === "pendiente")
    .map((s) => ({ solicitud: s, usuario: db.usuarios.find((u) => u.id === s.de)! }))
    .filter((x) => Boolean(x.usuario));
}

export function solicitudesEnviadas(db: DB, usuario_id: string) {
  return db.solicitudes
    .filter((s) => s.de === usuario_id && s.estado === "pendiente")
    .map((s) => ({ solicitud: s, usuario: db.usuarios.find((u) => u.id === s.para)! }))
    .filter((x) => Boolean(x.usuario));
}

export function eliminarAmigo(db: DB, usuario_id: string, amigo_id: string): DB {
  return {
    ...db,
    amigos: db.amigos.filter(
      (a) =>
        !(
          (a.usuario_a === usuario_id && a.usuario_b === amigo_id) ||
          (a.usuario_a === amigo_id && a.usuario_b === usuario_id)
        ),
    ),
  };
}

export function amigosDeUsuario(db: DB, usuario_id: string): Usuario[] {
  const ids = db.amigos
    .filter((a) => a.usuario_a === usuario_id || a.usuario_b === usuario_id)
    .map((a) => (a.usuario_a === usuario_id ? a.usuario_b : a.usuario_a));
  return db.usuarios.filter((u) => ids.includes(u.id));
}

/* ------------------------------------------------------------------ *
 * HU9 — Ranking global
 * GET /ranking?periodo=global   -> top 50 por xp_total
 * GET /ranking?periodo=semana   -> top 50 por XP de los últimos 7 días
 * Empates: racha_dias descendente.
 * ------------------------------------------------------------------ */
export function xpEnUltimosDias(db: DB, usuario_id: string, dias: number): number {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const vistas = new Set<string>();
  return db.progresos
    .filter((p) => p.usuario_id === usuario_id && p.completada && new Date(p.fecha) >= desde)
    .reduce((acc, p) => {
      if (vistas.has(p.leccion_id)) return acc;
      vistas.add(p.leccion_id);
      const l = db.lecciones.find((x) => x.id === p.leccion_id);
      return acc + (l?.xp_recompensa ?? 0);
    }, 0);
}

export function ranking(db: DB, periodo: "global" | "semana", yo: string | null): FilaRanking[] {
  return db.usuarios
    .map((u) => ({
      usuario_id: u.id,
      nombre: u.nombre,
      xp: periodo === "global" ? (u.xp_total ?? 0) : xpEnUltimosDias(db, u.id, 7),
      racha_dias: u.racha_dias ?? 0,
      es_yo: u.id === yo,
    }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0) || (b.racha_dias || 0) - (a.racha_dias || 0))
    .slice(0, 50)
    .map((f, i) => ({ posicion: i + 1, ...f }));
}

/* ------------------------------------------------------------------ *
 * HU10 — Ranking entre amigos
 * GET /usuarios/{id}/ranking-amigos
 * ------------------------------------------------------------------ */
export function rankingAmigos(db: DB, usuario_id: string): { filas: FilaRanking[]; posicion: number } {
  const yo = db.usuarios.find((u) => u.id === usuario_id);
  const grupo = yo ? [yo, ...amigosDeUsuario(db, usuario_id)] : amigosDeUsuario(db, usuario_id);
  const filas = grupo
    .map((u) => ({
      usuario_id: u.id,
      nombre: u.nombre,
      xp: u.xp_total ?? 0,
      racha_dias: u.racha_dias ?? 0,
      es_yo: u.id === usuario_id,
    }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0) || (b.racha_dias || 0) - (a.racha_dias || 0))
    .map((f, i) => ({ posicion: i + 1, ...f }));

  return { filas, posicion: filas.find((f) => f.es_yo)?.posicion ?? 0 };
}

/* ------------------------------------------------------------------ *
 * HU11 — Progreso por curso
 * GET /usuarios/{id}/cursos/{curso_id}/progreso  -> 404 si no está inscripto
 * ------------------------------------------------------------------ */
export function progresoCurso(db: DB, usuario_id: string, curso_id: string): Resultado<ProgresoCurso> {
  if (!db.usuario_cursos.some((uc) => uc.usuario_id === usuario_id && uc.curso_id === curso_id))
    return err(404, "El usuario no está inscripto al curso");

  const lecciones = leccionesDeCurso(db, curso_id);
  const completadas = lecciones.filter((l) => leccionCompletada(db, usuario_id, l.id));
  const proxima = lecciones.find((l) => !leccionCompletada(db, usuario_id, l.id)) ?? null;

  return ok({
    curso_id,
    total_lecciones: lecciones.length,
    completadas: completadas.length,
    porcentaje: lecciones.length ? Math.round((completadas.length / lecciones.length) * 100) : 0,
    proxima_leccion: proxima,
  });
}

/* ------------------------------------------------------------------ *
 * HU12 — Actividad diaria
 * GET /usuarios/{id}/actividad?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Los días sin actividad vienen con xp = 0 (heatmap).
 * ------------------------------------------------------------------ */
export function actividad(db: DB, usuario_id: string, desde: string, hasta: string): DiaActividad[] {
  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  const mapa = new Map<string, DiaActividad>();

  for (const d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const key = diaISO(d);
    mapa.set(key, { fecha: key, xp: 0, lecciones_completadas: 0 });
  }

  for (const p of db.progresos) {
    if (p.usuario_id !== usuario_id || !p.completada) continue;
    const key = diaISO(new Date(p.fecha));
    const dia = mapa.get(key);
    if (!dia) continue;
    const l = db.lecciones.find((x) => x.id === p.leccion_id);
    dia.xp += l?.xp_recompensa ?? 0;
    dia.lecciones_completadas += 1;
  }

  return [...mapa.values()];
}

/* ------------------------------------------------------------------ *
 * Preguntas (Admin)
 * POST /preguntas  { leccion_id, orden, pregunta, respuesta, es_premium }
 * ------------------------------------------------------------------ */
export async function crearPreguntaBackend(body: {
  leccion_id: string;
  pregunta: string;
  respuesta?: string;
  tipo: "traducir" | "unir_palabras" | "unir_oraciones";
  direccion: DireccionPregunta;
  es_premium: boolean;
}) {
  const data = await request<any>(`/preguntas/`, {
    method: "POST",
    body: JSON.stringify({
      leccion_id: Number(body.leccion_id),
      pregunta: body.pregunta,
      tipo: body.tipo,
      direccion: body.direccion,
      ...(body.respuesta ? { respuesta: body.respuesta } : {}),
      es_premium: body.es_premium,
    }),
  });
  return mapBackendPregunta(data);
}

export async function generarPreguntasVocabularioBackend(leccionId: string): Promise<Pregunta[]> {
  const data = await request<any[]>(`/preguntas/vocabulario/leccion/${leccionId}`);
  return (data ?? []).map(mapBackendPregunta);
}

export async function generarMatchVocabularioBackend(leccionId: string, esPremium = false): Promise<Pregunta> {
  let data: any;
  try {
    data = await request<any>(`/preguntas/vocabulario/matching/leccion/${leccionId}?es_premium=${esPremium}`, { method: "POST" });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.toLowerCase().includes("method not allowed")) throw error;
    data = await request<any>(`/preguntas/vocabulario/matching/leccion/${leccionId}`);
  }
  return mapBackendPregunta(data);
}

export async function eliminarPreguntaBackend(preguntaId: string): Promise<void> {
  await request<void>(`/preguntas/${preguntaId}`, { method: "DELETE" });
}

export async function listarPreguntasPorLeccion(leccionId: string, usuarioId?: string): Promise<Pregunta[]> {
  const query = usuarioId ? `?usuario_id=${encodeURIComponent(usuarioId)}` : "";
  const data = await request<any[]>(`/preguntas/leccion/${leccionId}${query}`);
  return (data ?? []).map(mapBackendPregunta);
}

export async function registrarProgresoBackend(body: {
  usuario_id: string;
  leccion_id: string;
  puntaje: number;
  completada: boolean;
}) {
  return request<any>("/progreso/", {
    method: "POST",
    body: JSON.stringify({
      usuario_id: Number(body.usuario_id),
      leccion_id: Number(body.leccion_id),
      puntaje: body.puntaje,
      completada: body.completada,
    }),
  });
}

export async function eliminarLeccion(leccionId: string): Promise<void> {
  await request<void>(`/lecciones/${leccionId}`, { method: "DELETE" });
}

export async function listarProgresoPorUsuario(usuarioId: string): Promise<Progreso[]> {
  const data = await request<any[]>(`/progreso/usuario/${usuarioId}`);
  return (data ?? []).map(mapBackendProgreso);
}

/* ------------------------------------------------------------------ *
 * Vocabulario (Admin)
 * POST /vocabulario  { palabra, traduccion, nivel, idioma_id }
 * GET  /vocabulario  ?nivel=A1
 * ------------------------------------------------------------------ */
export async function crearVocabularioBackend(body: {
  palabra: string;
  nivel: Nivel;
}) {
  const data = await request<any>(`/vocabulario/`, {
    method: "POST",
    body: JSON.stringify({
      palabra: body.palabra,
      nivel: body.nivel,
    }),
  });
  return mapBackendVocabulario(data);
}

export async function listarVocabulario(nivel?: Nivel): Promise<Vocabulario[]> {
  const params = new URLSearchParams();
  if (nivel) params.append("nivel", nivel);
  const query = params.toString();
  const data = await request<any[]>(`/vocabulario${query ? "?" + query : ""}`);
  return (data ?? []).map(mapBackendVocabulario);
}

export async function listarRankingBackend(periodo: "global" | "semana", usuarioId: string): Promise<FilaRanking[]> {
  const data = await request<any[]>(`/ranking/?periodo=${periodo}`);
  return (data ?? []).map((item) => ({
    posicion: Number(item.posicion), usuario_id: asStringId(item.usuario_id), nombre: String(item.nombre ?? ""),
    xp: Number(item.xp ?? 0), racha_dias: Number(item.racha_dias ?? 0), es_yo: asStringId(item.usuario_id) === usuarioId,
  }));
}

export async function enviarSolicitudBackend(usuarioId: string, amigoId: string) {
  return request<any>("/amistad/solicitudes", { method: "POST", body: JSON.stringify({ usuario_solicitante: Number(usuarioId), usuario_receptor: Number(amigoId) }) });
}

export async function listarSolicitudesBackend(usuarioId: string) {
  const data = await request<any[]>(`/amistad/solicitudes/pendientes/${usuarioId}`);
  return (data ?? []).map((item) => ({ id: asStringId(item.id), de: asStringId(item.usuario_solicitante), para: asStringId(item.usuario_receptor), estado: item.estado, fecha: String(item.fecha ?? "") }));
}

export async function responderSolicitudBackend(id: string | number, acepta: boolean) {
  return request<any>(`/amistad/solicitudes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado: acepta ? "aceptada" : "rechazada" }),
  });
}
export async function eliminarVocabulario(vocabularioId: string): Promise<void> {
  await request<void>(`/vocabulario/${vocabularioId}`, { method: "DELETE" });
}
