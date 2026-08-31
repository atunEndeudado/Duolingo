import type { Leccion, Pregunta, TipoPregunta } from "./types";

/**
 * Banco de preguntas por idioma.
 *
 * Cada par es [palabra/frase en español, traducción en el idioma del curso].
 * Las lecciones toman un tramo del banco de forma determinística, así el mock
 * es estable entre servidor y cliente (sin `Math.random`).
 *
 * GET /lecciones/{id}/preguntas -> Pregunta[]  (el backend filtra las premium
 * según la suscripción del usuario)
 */
const BANCOS: Record<string, Array<[string, string]>> = {
  en: [
    ["Hola", "Hello"],
    ["Gracias", "Thank you"],
    ["Buenos días", "Good morning"],
    ["Adiós", "Goodbye"],
    ["Por favor", "Please"],
    ["Agua", "Water"],
    ["Casa", "House"],
    ["Familia", "Family"],
    ["Comida", "Food"],
    ["Amigo", "Friend"],
    ["Rojo", "Red"],
    ["Trabajo", "Work"],
    ["Mañana", "Tomorrow"],
    ["Ayer", "Yesterday"],
    ["Escuela", "School"],
    ["Libro", "Book"],
  ],
  fr: [
    ["Hola", "Bonjour"],
    ["Gracias", "Merci"],
    ["Buenas noches", "Bonne nuit"],
    ["Adiós", "Au revoir"],
    ["Por favor", "S'il vous plaît"],
    ["Agua", "Eau"],
    ["Casa", "Maison"],
    ["Familia", "Famille"],
    ["Comida", "Nourriture"],
    ["Amigo", "Ami"],
    ["Rojo", "Rouge"],
    ["Trabajo", "Travail"],
    ["Mañana", "Demain"],
    ["Ayer", "Hier"],
    ["Escuela", "École"],
    ["Libro", "Livre"],
  ],
  de: [
    ["Hola", "Hallo"],
    ["Gracias", "Danke"],
    ["Buenos días", "Guten Morgen"],
    ["Adiós", "Auf Wiedersehen"],
    ["Por favor", "Bitte"],
    ["Agua", "Wasser"],
    ["Casa", "Haus"],
    ["Familia", "Familie"],
    ["Comida", "Essen"],
    ["Amigo", "Freund"],
    ["Rojo", "Rot"],
    ["Trabajo", "Arbeit"],
    ["Mañana", "Morgen"],
    ["Ayer", "Gestern"],
    ["Escuela", "Schule"],
    ["Libro", "Buch"],
  ],
  ja: [
    ["Hola", "こんにちは"],
    ["Gracias", "ありがとう"],
    ["Buenos días", "おはよう"],
    ["Adiós", "さようなら"],
    ["Por favor", "お願いします"],
    ["Agua", "みず"],
    ["Casa", "いえ"],
    ["Familia", "かぞく"],
    ["Comida", "たべもの"],
    ["Amigo", "ともだち"],
    ["Rojo", "あかい"],
    ["Trabajo", "しごと"],
    ["Mañana", "あした"],
    ["Ayer", "きのう"],
    ["Escuela", "がっこう"],
    ["Libro", "ほん"],
  ],
};

const PLANTILLAS = [
  (es: string) => `¿Cómo se dice "${es}"?`,
  (es: string) => `Elegí la traducción correcta de "${es}"`,
  (es: string) => `"${es}" se traduce como…`,
];

/** Secuencia determinística de tipos: mezcla los 3 formatos por lección. */
const SECUENCIA: TipoPregunta[] = [
  "opcion",
  "escritura",
  "match",
  "opcion",
  "escritura",
  "opcion",
  "match",
  "escritura",
  "opcion",
];

/** 6 preguntas gratuitas + 3 exclusivas de tuboLingo Premium por lección. */
export function generarPreguntas(leccion: Leccion, codigoIdioma: string): Pregunta[] {
  const banco = BANCOS[codigoIdioma] ?? BANCOS["en"]!;
  const total = 9;
  const inicio = (leccion.orden - 1) * 3;

  return Array.from({ length: total }, (_, k) => {
    const idx = (inicio + k) % banco.length;
    const par = banco[idx]!;
    const tipo = SECUENCIA[k % SECUENCIA.length]!;
    const base = {
      id: `${leccion.id}-q${k + 1}`,
      leccion_id: leccion.id,
      tipo,
      premium: k >= 6,
    };

    if (tipo === "escritura") {
      return {
        ...base,
        enunciado: `Escribí la traducción de "${par[0]}"`,
        respuesta: par[1],
      } satisfies Pregunta;
    }

    if (tipo === "match") {
      const pares = Array.from({ length: 5 }, (_, j) => {
        const p = banco[(idx + j * 3) % banco.length]!;
        return { es: p[0], tr: p[1] };
      });
      // deduplicar por si el banco es corto
      const unicos = pares.filter((p, i2) => pares.findIndex((q) => q.tr === p.tr) === i2);
      return {
        ...base,
        enunciado: "Uní cada palabra con su traducción",
        pares: unicos,
      } satisfies Pregunta;
    }

    const distractores = [1, 2, 3].map((d) => banco[(idx + d * 5) % banco.length]![1]);
    const opciones = [...distractores];
    const posicion = (idx + k) % 4;
    opciones.splice(posicion, 0, par[1]);

    return {
      ...base,
      enunciado: PLANTILLAS[k % PLANTILLAS.length]!(par[0]),
      opciones: opciones.slice(0, 4),
      correcta: Math.min(posicion, 3),
    } satisfies Pregunta;
  });
}

