import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import * as api from "@/lib/api";
import { diaISO } from "@/lib/mock-db";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/actividad")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Actividad diaria — Duolingo" },
      {
        name: "description",
        content:
          "Heatmap y gráfico de la XP ganada por día y las lecciones completadas en el rango que elijas.",
      },
      { property: "og:title", content: "Actividad diaria — Duolingo" },
      { property: "og:description", content: "XP por día y lecciones completadas por día." },
    ],
  }),
  component: Actividad,
});

function haceDias(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return diaISO(d);
}

function nivelHeat(xp: number) {
  if (xp === 0) return "heat-0";
  if (xp <= 15) return "heat-1";
  if (xp <= 30) return "heat-2";
  if (xp <= 50) return "heat-3";
  return "heat-4";
}

// HU12 — GET /usuarios/{id}/actividad?desde=&hasta=
function Actividad() {
  const { db, usuario } = useApp();
  const [desde, setDesde] = useState(haceDias(29));
  const [hasta, setHasta] = useState(haceDias(0));

  const dias = useMemo(
    () => (usuario ? api.actividad(db, usuario.id, desde, hasta) : []),
    [db, usuario, desde, hasta],
  );

  if (!usuario) {
    return <p className="text-sm text-muted-foreground">Registrate para ver tu actividad.</p>;
  }

  const totalXp = dias.reduce((a, d) => a + d.xp, 0);
  const totalLecciones = dias.reduce((a, d) => a + d.lecciones_completadas, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Actividad diaria</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los días sin actividad se devuelven con XP en 0 para poder dibujar el heatmap.
        </p>
      </header>

      <div className="card-pop flex flex-wrap items-end gap-4 p-5">
        <div className="space-y-1">
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="ml-auto text-sm">
          <p className="text-display text-2xl font-extrabold text-primary">{totalXp} XP</p>
          <p className="text-muted-foreground">
            {totalLecciones} lecciones en {dias.length} días
          </p>
        </div>
      </div>

      <section className="card-pop p-5">
        <h2 className="text-lg">Heatmap</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dias.map((d) => (
            <div
              key={d.fecha}
              title={`${d.fecha}: ${d.xp} XP · ${d.lecciones_completadas} lecciones`}
              className={`size-6 rounded-md border border-border ${nivelHeat(d.xp)}`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          Menos
          {["heat-0", "heat-1", "heat-2", "heat-3", "heat-4"].map((c) => (
            <span key={c} className={`size-4 rounded border border-border ${c}`} />
          ))}
          Más
        </div>
      </section>

      <section className="card-pop p-5">
        <h2 className="text-lg">XP por día</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dias}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="fecha"
                tickFormatter={(v: string) => v.slice(5)}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "0.75rem",
                }}
              />
              <Bar dataKey="xp" name="XP" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
