import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/cursos/")({
  head: () => ({
    meta: [
      { title: "Catálogo de cursos — Duolingo" },
      {
        name: "description",
        content:
          "Explorá cursos por idioma y nivel (A1 a C1) e inscribite. Podés cursar varios idiomas en paralelo.",
      },
      { property: "og:title", content: "Catálogo de cursos — Duolingo" },
      { property: "og:description", content: "Cursos por idioma y nivel, de A1 a C1." },
    ],
  }),
  component: Cursos,
});

// HU2 — Inscribirse a un curso. POST /usuarios/{id}/cursos
function Cursos() {
  const { db, usuario, inscribirse } = useApp();
  const [idioma, setIdioma] = useState<string>("todos");

  const cursos = db.cursos.filter((c) => idioma === "todos" || c.idioma_id === idioma);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Catálogo de cursos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Un curso pertenece a un idioma y tiene un nivel (A1, A2, B1, B2, C1). No podés inscribirte
          dos veces al mismo curso.
        </p>
      </header>

      <Tabs value={idioma} onValueChange={setIdioma}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          {db.idiomas.map((i) => (
            <TabsTrigger key={i.id} value={i.id}>
              {i.nombre}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => {
          const idiomaCurso = db.idiomas.find((i) => i.id === curso.idioma_id);
          const inscripto = Boolean(
            usuario &&
              db.usuario_cursos.some((uc) => uc.usuario_id === usuario.id && uc.curso_id === curso.id),
          );
          const lecciones = api.leccionesDeCurso(db, curso.id);
          const prog = usuario && inscripto ? api.progresoCurso(db, usuario.id, curso.id) : null;

          return (
            <article key={curso.id} className="card-pop flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg leading-tight">
                  {idiomaCurso?.nombre}
                  <span className="ml-2 rounded-lg bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-foreground">
                    {curso.nivel}
                  </span>
                </h2>
                <span className="rounded-lg bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {idiomaCurso?.codigo}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {lecciones.length} lecciones ·{" "}
                {lecciones.reduce((a, l) => a + l.xp_recompensa, 0)} XP disponibles
              </p>

              {prog?.ok ? (
                <div className="mt-3">
                  <Progress value={prog.data.porcentaje} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {prog.data.completadas}/{prog.data.total_lecciones} completadas
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex gap-2">
                {inscripto ? (
                  <>
                    <Button asChild size="sm" className="flex-1">
                      <Link to="/cursos/$cursoId" params={{ cursoId: curso.id }}>
                        Continuar
                      </Link>
                    </Button>
                    <span className="grid place-items-center rounded-xl bg-secondary px-2 text-secondary-foreground">
                      <Check className="size-4" />
                    </span>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 shadow-pop"
                    disabled={!usuario}
                    onClick={() => inscribirse(curso.id)}
                  >
                    Inscribirme
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
