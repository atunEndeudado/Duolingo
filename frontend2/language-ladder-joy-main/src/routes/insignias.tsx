import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";

export const Route = createFileRoute("/insignias")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Insignias — Duolingo" },
      {
        name: "description",
        content:
          "Desbloqueá insignias por hitos de XP, racha y lecciones completadas. Cada insignia se otorga una sola vez.",
      },
      { property: "og:title", content: "Insignias — Duolingo" },
      { property: "og:description", content: "Hitos de XP, racha y lecciones completadas." },
    ],
  }),
  component: Insignias,
});




// HU7 — GET /usuarios/{id}/insignias
function Insignias() {
  const { db, usuario } = useApp();

  if (!usuario) {
    return <p className="text-sm text-muted-foreground">Registrate para desbloquear insignias.</p>;
  }

  const lista = api.insigniasDeUsuario(db, usuario.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Insignias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {lista.filter((i) => i.desbloqueada).length} de {lista.length} desbloqueadas. Se otorgan
          automáticamente al cumplir el criterio.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map(({ insignia, desbloqueada, fecha }) => {
          return (
            <article
              key={insignia.id}
              className={`card-pop p-5 ${desbloqueada ? "" : "opacity-80"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-12 place-items-center rounded-2xl text-2xl ${
                    desbloqueada ? "bg-badge/40 shadow-pop" : "bg-locked"
                  }`}
                >
                  {desbloqueada ? insignia.icono : <Lock className="size-5 text-muted-foreground" />}
                </span>
                <div>
                  <h2 className="text-base leading-tight">{insignia.nombre}</h2>
                  <p className="text-xs text-muted-foreground">{insignia.descripcion}</p>
                </div>
              </div>

              {desbloqueada ? (

                <p className="mt-2 text-xs font-bold text-primary">
                  Obtenida el {fecha ? new Date(fecha).toLocaleDateString("es-AR") : "-"}
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Seguí aprendiendo para desbloquearla.</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
