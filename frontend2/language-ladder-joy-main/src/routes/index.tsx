import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Zap, BookOpen, Trophy, ArrowRight } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi progreso — Duolingo" },
      {
        name: "description",
        content:
          "Tu panel: XP acumulada, racha diaria, avance por curso y la próxima lección que te toca.",
      },
      { property: "og:title", content: "Mi progreso — Duolingo" },
      {
        property: "og:description",
        content: "XP, racha diaria, avance por curso y próxima lección.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { db, usuario } = useApp();

  if (!usuario) {
    return (
      <div className="card-pop mx-auto max-w-md p-8 text-center">
        <h1 className="text-2xl">Empezá a estudiar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Creá tu cuenta para acumular XP.</p>
        <Button asChild className="mt-4">
          <Link to="/registro">Registrarme</Link>
        </Button>
      </div>
    );
  }

  const inscripciones = api.cursosDeUsuario(db, usuario.id);
  const completadas = api.totalLeccionesCompletadas(db, usuario.id);
  const insignias = api.insigniasDeUsuario(db, usuario.id).filter((i) => i.desbloqueada);
  const { filas, posicion } = api.rankingAmigos(db, usuario.id);

  return (
    <div className="space-y-8">
      <section className="card-pop overflow-hidden">
        <div className="flex flex-wrap items-center gap-6 bg-secondary/60 p-6">
          <div className="grid size-16 place-items-center rounded-3xl bg-primary text-2xl text-primary-foreground shadow-pop">
            {usuario.nombre.charAt(0)}
          </div>
          <div className="min-w-40">
            <h1 className="text-2xl leading-tight">¡Hola, {usuario.nombre.split(" ")[0]}!</h1>
            <p className="text-sm text-muted-foreground">{usuario.email}</p>
          </div>
          <div className="ml-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Zap className="size-4" />} label="XP total" value={usuario.xp_total} />
            <Stat icon={<Flame className="size-4" />} label="Racha" value={`${usuario.racha_dias} d`} />
            <Stat icon={<BookOpen className="size-4" />} label="Lecciones" value={completadas} />
            <Stat icon={<Trophy className="size-4" />} label="Insignias" value={insignias.length} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl">Mis cursos</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/cursos">
              Ver catálogo <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {inscripciones.length === 0 ? (
          <div className="card-pop p-6 text-sm text-muted-foreground">
            Todavía no estás inscripto a ningún curso.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inscripciones.map(({ curso }) => {
              const res = api.progresoCurso(db, usuario.id, curso.id);
              const idioma = api.idiomaDeCurso(db, curso.id);
              if (!res.ok) return null;
              const p = res.data;
              return (
                <Link
                  key={curso.id}
                  to="/cursos/$cursoId"
                  params={{ cursoId: curso.id }}
                  className="card-pop block p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg">
                      {idioma?.nombre}{" "}
                      <span className="rounded-lg bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-foreground">
                        {curso.nivel}
                      </span>
                    </h3>
                    <span className="text-sm font-extrabold text-primary">{p.porcentaje}%</span>
                  </div>
                  <Progress value={p.porcentaje} className="mt-3" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    {p.completadas} de {p.total_lecciones} lecciones ·{" "}
                    {p.proxima_leccion
                      ? `Próxima: ${p.proxima_leccion.orden}. ${p.proxima_leccion.titulo}`
                      : "¡Curso terminado!"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-pop p-5">
          <h2 className="text-lg">Ranking entre amigos</h2>
          <p className="text-xs text-muted-foreground">
            Estás en la posición #{posicion} de {filas.length}
          </p>
          <ul className="mt-3 space-y-2">
            {filas.slice(0, 5).map((f) => (
              <li
                key={f.usuario_id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  f.es_yo ? "bg-secondary font-extrabold" : ""
                }`}
              >
                <span className="w-6 text-muted-foreground">{f.posicion}</span>
                <span className="flex-1 truncate">{f.nombre}</span>
                <span className="font-extrabold text-primary">{f.xp} XP</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/ranking">Ver rankings</Link>
          </Button>
        </div>

        <div className="card-pop p-5">
          <h2 className="text-lg">Insignias recientes</h2>
          {insignias.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Todavía no desbloqueaste ninguna.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {insignias.map(({ insignia }) => (
                <li
                  key={insignia.id}
                  className="flex items-center gap-2 rounded-xl bg-badge/30 px-3 py-2 text-sm font-bold text-badge-foreground"
                >
                  <span className="text-lg">{insignia.icono}</span> {insignia.nombre}
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/insignias">Ver todas</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card px-3 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-display text-xl font-extrabold">{value}</div>
    </div>
  );
}
