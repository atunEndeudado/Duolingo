import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Check, RotateCcw, ArrowLeft } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LeccionQuiz } from "@/components/LeccionQuiz";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Leccion } from "@/lib/types";

export const Route = createFileRoute("/cursos/$cursoId")({
  head: () => ({
    meta: [
      { title: "Ruta de lecciones — Duolingo" },
      {
        name: "description",
        content:
          "Completá las lecciones en orden: cada una se desbloquea al aprobar la anterior con 60 puntos o más.",
      },
      { property: "og:title", content: "Ruta de lecciones — Duolingo" },
      { property: "og:description", content: "Lecciones secuenciales, puntaje y XP por lección." },
    ],
  }),
  component: CursoDetalle,
});

// HU3/HU4/HU5/HU11 — GET /cursos/{id}/lecciones · POST /lecciones/{id}/completar
function CursoDetalle() {
  const { cursoId } = Route.useParams();
  const { db, usuario, completarLeccion, inscribirse } = useApp();
  const [abierta, setAbierta] = useState<Leccion | null>(null);

  const curso = db.cursos.find((c) => c.id === cursoId);
  if (!curso) throw notFound();
  const idioma = api.idiomaDeCurso(db, cursoId);
  const lecciones = api.leccionesDeCurso(db, cursoId);

  const progreso = usuario ? api.progresoCurso(db, usuario.id, cursoId) : null;
  const inscripto = Boolean(progreso?.ok);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/cursos">
          <ArrowLeft className="mr-1 size-4" /> Cursos
        </Link>
      </Button>

      <header className="card-pop p-6">
        <h1 className="text-3xl">
          {idioma?.nombre}{" "}
          <span className="rounded-lg bg-accent px-2 py-0.5 align-middle text-sm font-extrabold text-accent-foreground">
            {curso.nivel}
          </span>
        </h1>

        {progreso?.ok ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progreso.data.completadas} de {progreso.data.total_lecciones} lecciones
              </span>
              <span className="font-extrabold text-primary">{progreso.data.porcentaje}%</span>
            </div>
            <Progress value={progreso.data.porcentaje} className="mt-2" />
            <p className="mt-2 text-sm">
              {progreso.data.proxima_leccion
                ? `Próxima lección: ${progreso.data.proxima_leccion.orden}. ${progreso.data.proxima_leccion.titulo}`
                : "¡Completaste todo el curso! 🎉"}
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              404 — No estás inscripto a este curso, así que no hay progreso para mostrar.
            </p>
            <Button size="sm" disabled={!usuario} onClick={() => inscribirse(cursoId)}>
              Inscribirme
            </Button>
          </div>
        )}
      </header>

      <ol className="space-y-3">
        {lecciones.map((l) => {
          const completada = usuario ? api.leccionCompletada(db, usuario.id, l.id) : false;
          const desbloqueada = usuario ? !l.bloqueada : false;
          const intentos = db.progresos.filter(
            (p) => p.usuario_id === usuario?.id && p.leccion_id === l.id,
          );
          const mejor = intentos.reduce((m, p) => Math.max(m, p.puntaje), 0);

          return (
            <li
              key={l.id}
              className={`card-pop flex flex-wrap items-center gap-4 p-4 ${
                desbloqueada ? "" : "opacity-70"
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl text-base font-extrabold ${
                  completada
                    ? "bg-primary text-primary-foreground shadow-pop"
                    : desbloqueada
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-locked text-muted-foreground"
                }`}
              >
                {completada ? <Check className="size-5" /> : desbloqueada ? l.orden : <Lock className="size-4" />}
              </span>

              <div className="min-w-40 flex-1">
                <h2 className="text-base leading-tight">
                  {l.orden}. {l.titulo}
                </h2>
                <p className="text-xs text-muted-foreground">
                  +{l.xp_recompensa} XP
                  {intentos.length > 0 ? ` · ${intentos.length} intento(s) · mejor ${mejor}` : ""}
                  {!desbloqueada && !completada && l.orden > 1 ? " · requiere la lección anterior" : ""}
                </p>
              </div>

              <Button
                size="sm"
                variant={completada ? "outline" : "default"}
                disabled={!desbloqueada}
                className={completada ? "" : "shadow-pop"}
                onClick={() => setAbierta(l)}
              >
                {completada ? (
                  <>
                    <RotateCcw className="mr-1 size-4" /> Repetir
                  </>
                ) : (
                  "Empezar"
                )}
              </Button>
            </li>
          );
        })}
      </ol>

      <Dialog open={Boolean(abierta)} onOpenChange={(o) => !o && setAbierta(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-display">
              {abierta ? `${abierta.orden}. ${abierta.titulo}` : ""}
            </DialogTitle>
            <DialogDescription>
              Respondé las preguntas de la lección. Se aprueba con 60 o más; ahí se suma la XP y
              cuenta para la racha del día.
            </DialogDescription>
          </DialogHeader>

          {abierta ? (
            <LeccionQuiz
              key={abierta.id}
              leccion={abierta}
              preguntas={api.preguntasDeLeccion(db, abierta.id, Boolean(usuario?.premium))}
              premiumBloqueadas={
                usuario?.premium ? 0 : api.preguntasPremiumDeLeccion(db, abierta.id)
              }
              esPremium={Boolean(usuario?.premium)}
              onCerrar={() => setAbierta(null)}
              onFinalizar={async (p) => {
                if (await completarLeccion(abierta.id, p)) setAbierta(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
