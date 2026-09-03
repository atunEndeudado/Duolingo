import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock, Flame, UserPlus, Zap, Crown, Trophy, UserRound } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FilaRanking, Usuario } from "@/lib/types";


export const Route = createFileRoute("/ranking")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Ranking global y semanal — Duolingo" },
      {
        name: "description",
        content:
          "Top 50 por XP total o por XP de los últimos 7 días, con desempate por racha, más el ranking entre tus amigos.",
      },
      { property: "og:title", content: "Ranking global y semanal — Duolingo" },
      { property: "og:description", content: "Top 50 por XP y ranking entre amigos." },
    ],
  }),
  component: Ranking,
});

// HU9 — GET /ranking?periodo=global|semana  ·  HU10 — GET /usuarios/{id}/ranking-amigos
function Ranking() {
  const { db, usuario, enviarSolicitud } = useApp();
  const [tab, setTab] = useState<"global" | "semana" | "amigos">("global");
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Usuario | null>(null);

  const amigos = usuario ? api.rankingAmigos(db, usuario.id) : { filas: [], posicion: 0 };
  const filas: FilaRanking[] =
    tab === "amigos" ? amigos.filas : api.ranking(db, tab, usuario?.id ?? null);

  // HU8 — POST /usuarios/{id}/solicitudes { amigo_id }
  function estadoAmistad(otro_id: string) {
    if (!usuario || otro_id === usuario.id) return "yo" as const;
    if (api.sonAmigos(db, usuario.id, otro_id)) return "amigos" as const;
    if (api.solicitudPendiente(db, usuario.id, otro_id)) return "pendiente" as const;
    return "libre" as const;
  }

  const insignias = perfilSeleccionado
    ? db.insignias.filter((insignia) => api.cumpleCriterio(db, perfilSeleccionado.id, insignia))
    : [];
  const estadoSeleccionado = perfilSeleccionado ? estadoAmistad(perfilSeleccionado.id) : "yo";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top 50. Los empates se desempatan por racha descendente. Podés mandarle solicitud de
          amistad a cualquier perfil.
        </p>
      </header>


      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="amigos">Amigos</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "amigos" && usuario ? (
        <p className="text-sm font-bold">
          Tu posición en el grupo: #{amigos.posicion} de {amigos.filas.length}
        </p>
      ) : null}

      <ol className="card-pop divide-y-2 divide-border overflow-hidden">
        {filas.map((f) => (
          <li
            key={f.usuario_id}
            className={`flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${f.es_yo ? "bg-secondary/70" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Ver perfil de ${f.nombre}`}
            onClick={() => setPerfilSeleccionado(db.usuarios.find((u) => u.id === f.usuario_id) ?? null)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setPerfilSeleccionado(db.usuarios.find((u) => u.id === f.usuario_id) ?? null);
              }
            }}
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
                f.posicion <= 3
                  ? "bg-badge text-badge-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {f.posicion}
            </span>
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground"
            >
              {f.nombre.charAt(0).toUpperCase() || <UserRound className="size-5" />}
            </span>
            <span className={`flex-1 truncate ${f.es_yo ? "font-extrabold" : "font-semibold"}`}>
              {f.nombre}
              {f.es_yo ? " (vos)" : ""}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold text-streak">
              <Flame className="size-4" />
              {f.racha_dias}
            </span>
            <span className="w-24 text-right text-display font-extrabold text-primary">
              {f.xp} XP
            </span>
          </li>
        ))}
        {filas.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">Sin datos para este período.</li>
        ) : null}
      </ol>

      <Dialog
        open={Boolean(perfilSeleccionado)}
        onOpenChange={(open) => !open && setPerfilSeleccionado(null)}
      >
        <DialogContent>
          {perfilSeleccionado ? (
            <>
              <DialogHeader>
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary text-2xl font-extrabold text-secondary-foreground sm:mx-0">
                  {perfilSeleccionado.nombre.charAt(0).toUpperCase()}
                </div>
                <DialogTitle className="text-2xl">
                  {perfilSeleccionado.nombre}
                  {perfilSeleccionado.premium ? <Crown className="ml-2 inline size-5 text-badge" /> : null}
                </DialogTitle>
                <DialogDescription>{perfilSeleccionado.email}</DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border-2 border-border p-3">
                  <dt className="flex items-center gap-1 text-xs font-bold uppercase text-muted-foreground">
                    <Zap className="size-4" /> XP total
                  </dt>
                  <dd className="text-display text-xl font-extrabold">{perfilSeleccionado.xp_total ?? 0}</dd>
                </div>
                <div className="rounded-2xl border-2 border-border p-3">
                  <dt className="flex items-center gap-1 text-xs font-bold uppercase text-muted-foreground">
                    <Flame className="size-4" /> Racha
                  </dt>
                  <dd className="text-display text-xl font-extrabold">{perfilSeleccionado.racha_dias ?? 0} días</dd>
                </div>
              </dl>

              <section>
                <h3 className="flex items-center gap-2 font-bold"><Trophy className="size-4" /> Insignias</h3>
                {insignias.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {insignias.map((insignia) => (
                      <span key={insignia.id} className="rounded-lg bg-badge/20 px-2 py-1 text-sm font-semibold text-badge-foreground">
                        {insignia.icono} {insignia.nombre}
                      </span>
                    ))}
                  </div>
                ) : <p className="mt-2 text-sm text-muted-foreground">Todavía no tiene insignias.</p>}
              </section>

              {estadoSeleccionado === "libre" ? (
                <Button onClick={() => enviarSolicitud(perfilSeleccionado.id)}>
                  <UserPlus className="mr-1 size-4" /> Enviar solicitud de amistad
                </Button>
              ) : estadoSeleccionado === "pendiente" ? (
                <p className="text-sm font-semibold text-muted-foreground">Solicitud pendiente</p>
              ) : estadoSeleccionado === "amigos" ? (
                <p className="text-sm font-semibold text-muted-foreground">Ya son amigos</p>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
