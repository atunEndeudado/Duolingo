import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Crown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Leccion, ParMatch, Pregunta } from "@/lib/types";

interface Props {
  leccion: Leccion;
  preguntas: Pregunta[];
  premiumBloqueadas: number;
  esPremium: boolean;
  onFinalizar: (puntaje: number) => void;
  onCerrar: () => void;
}

/** Normaliza para comparar respuestas escritas (sin tildes, sin mayúsculas). */
function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

/** Mezcla una columna sin mutar el arreglo original. */
function mezclar<T>(items: T[]) {
  const resultado = [...items];
  for (let i = resultado.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j]!, resultado[i]!];
  }
  return resultado;
}

/**
 * Quiz real de la lección: entre 5 y 10 ejercicios de tres tipos
 * (multiple choice, match de columnas y escritura libre).
 * El puntaje enviado al backend es el porcentaje de ejercicios correctos.
 */
export function LeccionQuiz({
  leccion,
  preguntas,
  premiumBloqueadas,
  esPremium,
  onFinalizar,
  onCerrar,
}: Props) {
  const [indice, setIndice] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [terminado, setTerminado] = useState(false);

  // estado por ejercicio
  const [elegida, setElegida] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [verificado, setVerificado] = useState(false);
  const [izq, setIzq] = useState<string | null>(null);
  const [uniones, setUniones] = useState<Record<string, string>>({});
  const [paresResueltos, setParesResueltos] = useState<string[]>([]);
  const [oracionIndices, setOracionIndices] = useState<number[]>([]);

  const pregunta = preguntas[indice];
  const total = preguntas.length;
  const puntaje = useMemo(
    () => (total ? Math.round((correctas / total) * 100) : 0),
    [correctas, total],
  );
  const pares = pregunta?.pares ?? [];
  // Cada columna se mezcla por separado al cambiar de pregunta.
  const derecha = useMemo(() => mezclar(pares), [pregunta?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const izquierda = useMemo(() => mezclar(pares), [pregunta?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const bancoPalabras = useMemo(() => {
    const palabras = (pregunta?.respuesta ?? "").split(/\s+/).filter(Boolean);
    return mezclar(palabras.map((palabra, index) => ({ palabra, index })));
  }, [pregunta?.id, pregunta?.respuesta]);

  if (!pregunta) {
    return <p className="text-sm text-muted-foreground">Esta lección todavía no tiene preguntas.</p>;
  }

  const respuestaCorrecta = pregunta.respuesta ?? "";


  const acierto =
    pregunta.tipo === "opcion"
      ? normalizar((pregunta.opciones ?? [])[elegida ?? -1] ?? "") === normalizar(respuestaCorrecta)
      : pregunta.tipo === "escritura" || pregunta.tipo === "traducir"
        ? normalizar(texto) === normalizar(respuestaCorrecta)
        : pregunta.tipo === "oracion"
          ? normalizar(oracionIndices.map((index) => bancoPalabras.find((item) => item.index === index)?.palabra ?? "").join(" ")) ===
            normalizar(respuestaCorrecta)
          : pares.length > 0 && pares.every((par) => normalizar(uniones[par.es] ?? "") === normalizar(par.tr));

  const respondida =
    pregunta.tipo === "opcion"
      ? elegida !== null
      : pregunta.tipo === "escritura" || pregunta.tipo === "traducir"
        ? verificado
        : pregunta.tipo === "oracion"
          ? oracionIndices.length === (pregunta.palabras?.length ?? 0)
          : paresResueltos.length === pares.length;

  function siguiente() {
    if (acierto) setCorrectas((c) => c + 1);
    setElegida(null);
    setTexto("");
    setVerificado(false);
    setIzq(null);
    setUniones({});
    setParesResueltos([]);
    setOracionIndices([]);
    if (indice + 1 < total) setIndice(indice + 1);
    else setTerminado(true);
  }

  function tocarDerecha(tr: string) {
    if (!izq) return;
    const par = pares.find((item) => item.es === izq);
    if (!par) return;
    setUniones((prev) => ({ ...prev, [izq]: tr }));
    setParesResueltos((prev) => (prev.includes(izq) ? prev : [...prev, izq]));
    setIzq(null);
  }

  function elegirPalabra(index: number) {
    setOracionIndices((actual) => [...actual, index]);
  }

  if (terminado) {
    const aprobado = puntaje >= 60;
    return (
      <div className="space-y-4 text-center">
        <p className="text-6xl">{aprobado ? "🎉" : "😅"}</p>
        <p className="text-display text-4xl font-extrabold text-primary">{puntaje}</p>
        <p className="text-sm text-muted-foreground">
          {correctas} de {total} correctas.{" "}
          {aprobado
            ? `Aprobaste: se suman +${leccion.xp_recompensa} XP y cuenta para tu racha.`
            : "Necesitás 60 para aprobar. Podés reintentar."}
        </p>
        {!esPremium && premiumBloqueadas > 0 ? (
          <p className="rounded-2xl bg-badge/15 p-3 text-xs font-bold text-badge-foreground">
            <Crown className="mr-1 inline size-4" />
            Hay {premiumBloqueadas} preguntas más en esta lección con Premium.
          </p>
        ) : null}
        <Button className="shadow-pop" onClick={() => onFinalizar(puntaje)}>
          Salir
        </Button>
      </div>
    );
  }

  const etiquetaTipo =
    pregunta.tipo === "opcion"
      ? "Multiple choice"
      : pregunta.tipo === "match" || pregunta.tipo === "unir_palabras"
        ? "Unir columnas"
        : pregunta.tipo === "oracion"
          ? "Formar oración"
          : "Escribir la traducción";

  const tituloEjercicio =
    pregunta.tipo === "escritura" || pregunta.tipo === "traducir"
      ? "Traduce la siguiente frase:"
      : pregunta.tipo === "match" || pregunta.tipo === "unir_palabras"
        ? "Une cada palabra con su traducción:"
        : pregunta.tipo === "oracion"
          ? "Forma la oración correcta:"
          : "Selecciona la respuesta correcta:";

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>
            Ejercicio {indice + 1} de {total} · {etiquetaTipo}
            {pregunta.premium ? " · Premium" : ""}
          </span>
          <span>{correctas} correctas</span>
        </div>
        <Progress value={(indice / total) * 100} className="mt-2" />
      </div>

      <h3 className="text-display text-xl font-extrabold">{tituloEjercicio}</h3>
      <p className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm font-semibold">{pregunta.pregunta}</p>

      {pregunta.tipo === "opcion" ? (
        <div className="grid gap-2">
          {(pregunta.opciones ?? []).map((op, i) => {
            const esCorrecta = i === pregunta.correcta;
            const estado =
              elegida === null
                ? "border-border hover:bg-secondary"
                : esCorrecta
                  ? "border-primary bg-primary/10"
                  : i === elegida
                    ? "border-destructive bg-destructive/10"
                    : "border-border opacity-60";
            return (
              <button
                key={op}
                type="button"
                disabled={elegida !== null}
                onClick={() => setElegida(i)}
                className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-colors ${estado}`}
              >
                {op}
                {elegida !== null && esCorrecta ? <Check className="size-4 text-primary" /> : null}
                {elegida !== null && !esCorrecta && i === elegida ? (
                  <X className="size-4 text-destructive" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {pregunta.tipo === "escritura" || pregunta.tipo === "traducir" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (texto.trim()) setVerificado(true);
          }}
          className="space-y-2"
        >
          <Input
            autoFocus
            value={texto}
            disabled={verificado}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí tu respuesta…"
          />
          {!verificado ? (
            <Button type="submit" variant="secondary" disabled={!texto.trim()}>
              Verificar
            </Button>
          ) : null}
        </form>
      ) : null}

      {pregunta.tipo === "match" || pregunta.tipo === "unir_palabras" ? (
        <div className="grid grid-cols-2 gap-3">
          <ul className="space-y-2">
            {izquierda.map((p) => {
              const unida = uniones[p.es];
              const resuelta = paresResueltos.includes(p.es);
              return (
                <li key={p.es}>
                  <button
                    type="button"
                    disabled={resuelta}
                    onClick={() => setIzq(izq === p.es ? null : p.es)}
                    className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition-colors ${
                      izq === p.es
                        ? "border-primary bg-primary/10"
                        : resuelta
                          ? normalizar(uniones[p.es] ?? "") === normalizar(pares.find((par) => par.es === p.es)?.tr ?? "")
                            ? "border-primary bg-primary/10 opacity-60"
                            : "border-destructive bg-destructive/10"
                            : "border-border hover:bg-secondary"
                    }`}
                  >
                    <span className="block">{p.es}</span>
                    {unida ? (
                      <span className="block text-xs font-semibold text-muted-foreground">
                        → {unida}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <ul className="space-y-2">
            {derecha.map((p) => {
              const usadaPor = paresResueltos.find((es) => uniones[es] === p.tr);
              const usada = Boolean(usadaPor);
              const unionCorrecta = usadaPor
                ? normalizar(pares.find((par) => par.es === usadaPor)?.tr ?? "") === normalizar(p.tr)
                : false;
              return (
                <li key={p.tr}>
                  <button
                    type="button"
                    disabled={!izq || usada}
                    onClick={() => tocarDerecha(p.tr)}
                    className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition-colors ${
                      usada
                        ? unionCorrecta
                          ? "border-primary bg-primary/10 opacity-60"
                          : "border-destructive bg-destructive/10"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {p.tr}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {pregunta.tipo === "oracion" ? (
        <div className="space-y-4">
          <div className="min-h-14 rounded-2xl border-2 border-dashed border-border p-3">
            {oracionIndices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {oracionIndices.map((wordIndex, index) => (
                  <span key={`${wordIndex}-${index}`} className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold">
                  {bancoPalabras.find((item) => item.index === wordIndex)?.palabra}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Elegí las palabras para formar la oración</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {bancoPalabras.map(({ palabra, index }) => {
              const usada = oracionIndices.includes(index);
              return (
                <Button
                  key={`${palabra}-${index}`}
                  type="button"
                  variant="outline"
                  disabled={usada || respondida}
                  onClick={() => elegirPalabra(index)}
                >
                  {palabra}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {(pregunta.tipo === "match" || pregunta.tipo === "unir_palabras") && !respondida ? (
        <p className="text-xs text-muted-foreground">
          Tocá una palabra de la izquierda y después su traducción a la derecha.
        </p>
      ) : null}

      {respondida ? (
        <p className={`text-sm font-bold ${acierto ? "text-primary" : "text-destructive"}`}>
          {acierto
            ? "¡Correcto!"
            : pregunta.tipo === "opcion"
              ? `La respuesta era "${(pregunta.opciones ?? [])[pregunta.correcta ?? 0]}"`
              : pregunta.tipo === "escritura" || pregunta.tipo === "traducir"
                ? `La respuesta era "${respuestaCorrecta}"`
                : pregunta.tipo === "oracion"
                  ? `La respuesta correcta es "${respuestaCorrecta}"`
                  : "Hay uniones incorrectas."}
        </p>
      ) : null}

      {!esPremium && premiumBloqueadas > 0 && indice === 0 ? (
        <p className="text-xs text-muted-foreground">
          <Crown className="mr-1 inline size-3.5 text-badge" />
          {premiumBloqueadas} preguntas extra bloqueadas.{" "}
          <Link to="/premium" className="font-bold underline">
            Desbloquear con Premium
          </Link>
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button className="shadow-pop" disabled={!respondida} onClick={siguiente}>
          {indice + 1 === total ? "Ver resultado" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
