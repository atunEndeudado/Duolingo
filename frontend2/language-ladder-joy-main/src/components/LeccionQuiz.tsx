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
    .replace(/[\u0300-\u036f]/g, "");
}

/** Orden determinístico y "desordenado" de las traducciones del match. */
function desordenar(pares: ParMatch[]) {
  return pares
    .map((p, i) => ({ p, k: (i * 7 + 3) % pares.length }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.p);
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

  const pregunta = preguntas[indice];
  const total = preguntas.length;
  const puntaje = useMemo(
    () => (total ? Math.round((correctas / total) * 100) : 0),
    [correctas, total],
  );
  const pares = pregunta?.pares ?? [];
  const derecha = useMemo(() => desordenar(pares), [pregunta?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pregunta) {
    return <p className="text-sm text-muted-foreground">Esta lección todavía no tiene preguntas.</p>;
  }



  const acierto =
    pregunta.tipo === "opcion"
      ? elegida === pregunta.correcta
      : pregunta.tipo === "escritura"
        ? normalizar(texto) === normalizar(pregunta.respuesta ?? "")
        : pares.length > 0 && pares.every((p) => uniones[p.es] === p.tr);

  const respondida =
    pregunta.tipo === "opcion"
      ? elegida !== null
      : pregunta.tipo === "escritura"
        ? verificado
        : Object.keys(uniones).length === pares.length;

  function siguiente() {
    if (acierto) setCorrectas((c) => c + 1);
    setElegida(null);
    setTexto("");
    setVerificado(false);
    setIzq(null);
    setUniones({});
    if (indice + 1 < total) setIndice(indice + 1);
    else setTerminado(true);
  }

  function tocarDerecha(tr: string) {
    if (!izq) return;
    setUniones((prev) => {
      const limpio = Object.fromEntries(Object.entries(prev).filter(([, v]) => v !== tr));
      return { ...limpio, [izq]: tr };
    });
    setIzq(null);
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
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onCerrar}>
            Salir
          </Button>
          <Button className="shadow-pop" onClick={() => onFinalizar(puntaje)}>
            Enviar resultado
          </Button>
        </div>
      </div>
    );
  }

  const etiquetaTipo =
    pregunta.tipo === "opcion"
      ? "Multiple choice"
      : pregunta.tipo === "match"
        ? "Unir columnas"
        : "Escribir la traducción";

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

      <h3 className="text-display text-xl font-extrabold">{pregunta.enunciado}</h3>

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

      {pregunta.tipo === "escritura" ? (
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

      {pregunta.tipo === "match" ? (
        <div className="grid grid-cols-2 gap-3">
          <ul className="space-y-2">
            {pares.map((p) => {
              const unida = uniones[p.es];
              const ok = respondida ? unida === p.tr : null;
              return (
                <li key={p.es}>
                  <button
                    type="button"
                    disabled={respondida}
                    onClick={() => setIzq(izq === p.es ? null : p.es)}
                    className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition-colors ${
                      izq === p.es
                        ? "border-primary bg-primary/10"
                        : ok === false
                          ? "border-destructive bg-destructive/10"
                          : ok === true
                            ? "border-primary bg-primary/10"
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
              const usada = Object.values(uniones).includes(p.tr);
              return (
                <li key={p.tr}>
                  <button
                    type="button"
                    disabled={respondida}
                    onClick={() => tocarDerecha(p.tr)}
                    className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition-colors ${
                      usada ? "border-border opacity-50" : "border-border hover:bg-secondary"
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

      {pregunta.tipo === "match" && !respondida ? (
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
              : pregunta.tipo === "escritura"
                ? `La respuesta era "${pregunta.respuesta}"`
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
