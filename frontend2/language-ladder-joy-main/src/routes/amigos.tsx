import { createFileRoute } from "@tanstack/react-router";
import { Flame, Zap, UserPlus, UserMinus, Check, X, Clock, Crown } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/amigos")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Amigos y solicitudes — Duolingo" },
      {
        name: "description",
        content:
          "Enviá solicitudes de amistad: la otra persona decide si acepta. Después compará XP y racha.",
      },
      { property: "og:title", content: "Amigos y solicitudes — Duolingo" },
      { property: "og:description", content: "Solicitudes de amistad con confirmación de ambas partes." },
    ],
  }),
  component: Amigos,
});

// HU8 — POST /usuarios/{id}/solicitudes · PATCH /solicitudes/{id} · GET /usuarios/{id}/amigos
function Amigos() {
  const { db, usuario, enviarSolicitud, responderSolicitud, cancelarSolicitud, eliminarAmigo } =
    useApp();

  if (!usuario) {
    return <p className="text-sm text-muted-foreground">Registrate para agregar amigos.</p>;
  }

  const misAmigos = api.amigosDeUsuario(db, usuario.id);
  const misAmigosIds = new Set(misAmigos.map((a) => a.id));
  const recibidas = api.solicitudesRecibidas(db, usuario.id);
  const enviadas = api.solicitudesEnviadas(db, usuario.id);
  const pendientesIds = new Set([
    ...recibidas.map((r) => r.usuario.id),
    ...enviadas.map((r) => r.usuario.id),
  ]);
  const sugeridos = db.usuarios.filter(
    (u) => u.id !== usuario.id && !misAmigosIds.has(u.id) && !pendientesIds.has(u.id),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl">Amigos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {misAmigos.length} amigos · {recibidas.length} solicitudes recibidas · {enviadas.length}{" "}
          enviadas. Una amistad se crea solo cuando la otra persona acepta.
        </p>
      </header>

      <section>
        <h2 className="text-xl">Solicitudes recibidas</h2>
        <p className="text-sm text-muted-foreground">
          ¿Querés ser amigo/a de estas personas? Vos decidís.
        </p>
        <ul className="mt-3 card-pop divide-y-2 divide-border">
          {recibidas.map(({ solicitud, usuario: u }) => (
            <li key={solicitud.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-accent text-base font-extrabold text-accent-foreground">
                {u.nombre.charAt(0)}
              </span>
              <div className="min-w-32 flex-1">
                <p className="font-semibold leading-tight">{u.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Te envió una solicitud · {u.xp_total} XP
                </p>
              </div>
              <Button size="sm" onClick={() => responderSolicitud(solicitud.id, true)}>
                <Check className="mr-1 size-4" /> Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => responderSolicitud(solicitud.id, false)}
              >
                <X className="mr-1 size-4" /> Rechazar
              </Button>
            </li>
          ))}
          {recibidas.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No tenés solicitudes nuevas.</li>
          ) : null}
        </ul>
      </section>

      {enviadas.length > 0 ? (
        <section>
          <h2 className="text-xl">Solicitudes enviadas</h2>
          <ul className="mt-3 card-pop divide-y-2 divide-border">
            {enviadas.map(({ solicitud, usuario: u }) => (
              <li key={solicitud.id} className="flex items-center gap-3 px-4 py-3">
                <Clock className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate font-semibold">{u.nombre}</span>
                <span className="text-xs text-muted-foreground">Esperando respuesta</span>
                <Button size="sm" variant="ghost" onClick={() => cancelarSolicitud(solicitud.id)}>
                  Cancelar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {misAmigos.map((a) => (
          <article key={a.id} className="card-pop flex items-center gap-4 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-lg font-extrabold text-secondary-foreground">
              {a.nombre.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base leading-tight">
                {a.nombre}
                {a.premium ? <Crown className="ml-1 inline size-4 text-badge" /> : null}
              </h2>
              <p className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-bold text-xp-foreground">
                  <Zap className="size-3.5" />
                  {a.xp_total} XP
                </span>
                <span className="flex items-center gap-1 font-bold text-streak">
                  <Flame className="size-3.5" />
                  {a.racha_dias} d
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar a ${a.nombre}`}
              onClick={() => eliminarAmigo(a.id)}
            >
              <UserMinus className="size-4" />
            </Button>
          </article>
        ))}
        {misAmigos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no agregaste a nadie.</p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl">Sugerencias</h2>
        <ul className="mt-3 card-pop divide-y-2 divide-border">
          {sugeridos.map((u) => (
            <li key={u.id} className="flex items-center gap-4 px-4 py-3">
              <span className="flex-1 truncate font-semibold">{u.nombre}</span>
              <span className="text-sm text-muted-foreground">{u.xp_total} XP</span>
              <Button size="sm" variant="outline" onClick={() => enviarSolicitud(u.id)}>
                <UserPlus className="mr-1 size-4" /> Enviar solicitud
              </Button>
            </li>
          ))}
          {sugeridos.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No quedan perfiles para invitar.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
