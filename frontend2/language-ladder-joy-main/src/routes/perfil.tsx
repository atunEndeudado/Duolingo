import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Zap } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Mi perfil — tuboLingo" },
      {
        name: "description",
        content: "Datos de tu cuenta, XP total, racha y cambio rápido de usuario para probar la app.",
      },
      { property: "og:title", content: "Mi perfil — tuboLingo" },
      { property: "og:description", content: "Tus datos, XP total y racha diaria." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { db, usuario, cancelarPremium } = useApp();
  if (!usuario) return <p className="text-sm text-muted-foreground">No hay sesión activa.</p>;

  const completadas = api.totalLeccionesCompletadas(db, usuario.id);

  return (
    <div className="space-y-6">
      <header className="card-pop p-6">
        <h1 className="text-3xl">
          {usuario.nombre}
          {usuario.premium ? (
            <span className="ml-2 rounded-lg bg-badge/20 px-2 py-0.5 align-middle text-xs font-extrabold uppercase text-badge-foreground">
              Premium
            </span>
          ) : null}
        </h1>
        <p className="text-sm text-muted-foreground">{usuario.email}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-4">
          <Dato label="XP total" valor={`${usuario.xp_total}`} icon={<Zap className="size-4" />} />
          <Dato
            label="Racha"
            valor={`${usuario.racha_dias} días`}
            icon={<Flame className="size-4" />}
          />
          <Dato label="Lecciones" valor={`${completadas}`} />
          <Dato
            label="Última actividad"
            valor={
              usuario.fecha_ultima_actividad
                ? new Date(usuario.fecha_ultima_actividad).toLocaleDateString("es-AR")
                : "—"
            }
          />
        </dl>
      </header>

      <section className="card-pop p-6">
        <h2 className="text-xl">Suscripción</h2>
        {usuario.premium ? (
          <>
            <p className="text-sm text-muted-foreground">
              Tenés tuboLingo Premium activo: se desbloquean las preguntas extra de cada lección.
            </p>
            <Button className="mt-3" size="sm" variant="outline" onClick={cancelarPremium}>
              Cancelar suscripción
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Plan gratuito. Con Premium sumás preguntas extra por lección y más XP.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link to="/premium">Ver Premium</Link>
            </Button>
          </>
        )}
      </section>

      <section className="card-pop p-6">
        <h2 className="text-xl">Sesión</h2>
        <p className="text-sm text-muted-foreground">
          La sesión está ligada a esta cuenta: no se puede cambiar de perfil desde la app.
        </p>
      </section>
    </div>
  );
}

function Dato({
  label,
  valor,
  icon,
}: {
  label: string;
  valor: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-border p-3">
      <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-display text-xl font-extrabold">{valor}</dd>
    </div>
  );
}
