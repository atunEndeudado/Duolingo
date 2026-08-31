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
} from "./types";

export interface DB {
  usuarios: Usuario[];
  idiomas: Idioma[];
  cursos: Curso[];
  lecciones: Leccion[];
  preguntas: Pregunta[];
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

function hace(dias: number): Date {
  const d = new Date(HOY);
  d.setDate(d.getDate() - dias);
  return d;
}

const idiomas: Idioma[] = [
  { id: "id-en", nombre: "Inglés", codigo: "en" },
  { id: "id-fr", nombre: "Francés", codigo: "fr" },
  { id: "id-de", nombre: "Alemán", codigo: "de" },
  { id: "id-ja", nombre: "Japonés", codigo: "ja" },
];

const cursos: Curso[] = [
  { id: "c-en-a1", idioma_id: "id-en", nivel: "A1" },
  { id: "c-en-a2", idioma_id: "id-en", nivel: "A2" },
  { id: "c-en-b1", idioma_id: "id-en", nivel: "B1" },
  { id: "c-fr-a1", idioma_id: "id-fr", nivel: "A1" },
  { id: "c-fr-b2", idioma_id: "id-fr", nivel: "B2" },
  { id: "c-de-a1", idioma_id: "id-de", nivel: "A1" },
  { id: "c-de-c1", idioma_id: "id-de", nivel: "C1" },
  { id: "c-ja-a1", idioma_id: "id-ja", nivel: "A1" },
];

const titulosPorCurso: Record<string, string[]> = {
  "c-en-a1": ["Saludos", "Presentarse", "Números", "Familia", "Comida", "Colores", "La casa", "Repaso 1"],
  "c-en-a2": ["Rutinas", "Pasado simple", "Viajes", "Compras", "Salud", "Repaso 2"],
  "c-en-b1": ["Condicionales", "Trabajo", "Noticias", "Opiniones", "Repaso 3"],
  "c-fr-a1": ["Bonjour", "Les nombres", "La famille", "Au café", "La ville", "Révision"],
  "c-fr-b2": ["Subjonctif", "Débats", "Littérature", "Révision"],
  "c-de-a1": ["Hallo", "Zahlen", "Familie", "Essen", "Wiederholung"],
  "c-de-c1": ["Redewendungen", "Wirtschaft", "Politik"],
  "c-ja-a1": ["ひらがな 1", "ひらがな 2", "Saludos", "Números", "Comida"],
};

const lecciones: Leccion[] = Object.entries(titulosPorCurso).flatMap(([curso_id, titulos]) =>
  titulos.map((titulo, i) => ({
    id: `${curso_id}-l${i + 1}`,
    curso_id,
    orden: i + 1,
    titulo,
    // xp_recompensa entre 5 y 50
    xp_recompensa: Math.min(50, 10 + i * 5),
  })),
);

const preguntas: Pregunta[] = lecciones.flatMap((l) => {
  const curso = cursos.find((c) => c.id === l.curso_id)!;
  const idioma = idiomas.find((i) => i.id === curso.idioma_id)!;
  return generarPreguntas(l, idioma.codigo);
});

const insignias: Insignia[] = [
  { id: "b-xp100", nombre: "Primeros pasos", descripcion: "Alcanzá 100 XP", criterio: { tipo: "xp", valor: 100 }, icono: "🌱" },
  { id: "b-xp500", nombre: "Imparable", descripcion: "Alcanzá 500 XP", criterio: { tipo: "xp", valor: 500 }, icono: "🚀" },
  { id: "b-xp1000", nombre: "Leyenda", descripcion: "Alcanzá 1000 XP", criterio: { tipo: "xp", valor: 1000 }, icono: "👑" },
  { id: "b-racha3", nombre: "Constancia", descripcion: "Racha de 3 días", criterio: { tipo: "racha", valor: 3 }, icono: "🔥" },
  { id: "b-racha7", nombre: "Semana perfecta", descripcion: "Racha de 7 días", criterio: { tipo: "racha", valor: 7 }, icono: "⚡" },
  { id: "b-lecc10", nombre: "Aprendiz", descripcion: "Completá 10 lecciones", criterio: { tipo: "lecciones_completadas", valor: 10 }, icono: "📗" },
  { id: "b-lecc20", nombre: "Estudioso", descripcion: "Completá 20 lecciones", criterio: { tipo: "lecciones_completadas", valor: 20 }, icono: "🎓" },
];

const nombresAmigos: Array<[string, string, number, number]> = [
  ["u2", "Sofía Ramírez", 1420, 12],
  ["u3", "Mateo Duarte", 980, 5],
  ["u4", "Lucía Fernández", 760, 9],
  ["u5", "Bruno Aguirre", 610, 2],
  ["u6", "Camila Ortiz", 430, 21],
  ["u7", "Nicolás Peña", 2210, 3],
  ["u8", "Valentina Ruiz", 1875, 30],
  ["u9", "Tomás Bianchi", 320, 1],
  ["u10", "Julieta Molina", 145, 4],
];

const usuarios: Usuario[] = [
  {
    id: "u1",
    email: "ana@correo.com",
    nombre: "Ana Gómez",
    xp_total: 0,
    racha_dias: 4,
    fecha_ultima_actividad: hace(0).toISOString(),
    premium: false,
  },
  ...nombresAmigos.map(([id, nombre, xp, racha]) => ({
    id,
    email: `${id}@correo.com`,
    nombre,
    xp_total: xp,
    racha_dias: racha,
    fecha_ultima_actividad: hace(1).toISOString(),
    premium: ["u2", "u8"].includes(id),
  })),
];

// Progreso inicial de Ana: inglés A1 con 5 lecciones completas, francés A1 con 2.
const progresos: Progreso[] = [];
let pid = 0;
function completar(leccion_id: string, puntaje: number, diasAtras: number) {
  const l = lecciones.find((x) => x.id === leccion_id)!;
  progresos.push({
    id: `p${++pid}`,
    usuario_id: "u1",
    leccion_id,
    puntaje,
    completada: puntaje >= 60,
    fecha: hace(diasAtras).toISOString(),
  });
  if (puntaje >= 60) usuarios[0]!.xp_total += l.xp_recompensa;
}

completar("c-en-a1-l1", 100, 9);
completar("c-en-a1-l2", 80, 8);
completar("c-en-a1-l3", 45, 6);
completar("c-en-a1-l3", 90, 6);
completar("c-en-a1-l4", 70, 3);
completar("c-en-a1-l5", 85, 1);
completar("c-fr-a1-l1", 95, 2);
completar("c-fr-a1-l2", 65, 0);

const usuario_cursos: UsuarioCurso[] = [
  { usuario_id: "u1", curso_id: "c-en-a1", fecha_inscripcion: hace(10).toISOString() },
  { usuario_id: "u1", curso_id: "c-fr-a1", fecha_inscripcion: hace(4).toISOString() },
];

const usuario_insignias: UsuarioInsignia[] = [
  { usuario_id: "u1", insignia_id: "b-xp100", fecha: hace(6).toISOString() },
  { usuario_id: "u1", insignia_id: "b-racha3", fecha: hace(2).toISOString() },
];

const amigos: Amistad[] = ["u2", "u3", "u4", "u6", "u8"].map((u, i) => ({
  usuario_a: "u1",
  usuario_b: u,
  fecha: hace(20 - i).toISOString(),
}));

// Solicitudes pendientes que Ana recibió (HU8)
const solicitudes: SolicitudAmistad[] = [
  { id: "s1", de: "u5", para: "u1", estado: "pendiente", fecha: hace(2).toISOString() },
  { id: "s2", de: "u7", para: "u1", estado: "pendiente", fecha: hace(1).toISOString() },
  { id: "s3", de: "u1", para: "u9", estado: "pendiente", fecha: hace(3).toISOString() },
];

export const dbInicial: DB = {
  usuarios,
  idiomas,
  cursos,
  lecciones,
  preguntas,
  progresos,
  insignias,
  usuario_cursos,
  usuario_insignias,
  amigos,
  solicitudes,
  usuario_actual: "u1",
};
