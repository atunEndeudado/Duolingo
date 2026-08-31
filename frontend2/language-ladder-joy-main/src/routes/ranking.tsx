import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock, Flame, UserPlus } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FilaRanking } from "@/lib/types";


export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking global y semanal — tuboLingo" },
      {
        name: "description",
        content:
          "Top 50 por XP total o por XP de los últimos 7 días, con desempate por racha, más el ranking entre tus amigos.",
      },
      { property: "og:title", content: "Ranking global y semanal — tuboLingo" },
      { property: "og:description", content: "Top 50 por XP y ranking entre amigos." },
    ],
  }),
  component: Ranking,
});

// HU9 — GET /ranking?periodo=global|semana  ·  HU10 — GET /usuarios/{id}/ranking-amigos
function Ranking() {
  const { db, usuario, enviarSolicitud } = useApp();
  const [tab, setTab] = useState<"global" | "semana" | "amigos">("global");

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
            className={`flex items-center gap-4 px-4 py-3 ${f.es_yo ? "bg-secondary/70" : ""}`}
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
    </div>
  );
}
