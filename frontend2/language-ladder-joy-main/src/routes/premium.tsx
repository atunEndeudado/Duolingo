import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, CreditCard, Lock } from "lucide-react";

import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Duolingo Premium — más preguntas por lección" },
      {
        name: "description",
        content:
          "Suscribite a Duolingo Premium y desbloqueá las preguntas extra de cada lección, sin límites de repetición.",
      },
      { property: "og:title", content: "Duolingo Premium" },
      {
        property: "og:description",
        content: "Pagá tu plan y desbloqueá preguntas extra en todas las lecciones.",
      },
    ],
  }),
  component: Premium,
});

const PLANES = [
  {
    id: "mensual",
    nombre: "Mensual",
    precio: "USD 6,99",
    periodo: "por mes",
    detalle: "Cancelás cuando quieras.",
  },
  {
    id: "anual",
    nombre: "Anual",
    precio: "USD 49,99",
    periodo: "por año",
    detalle: "Equivale a USD 4,17 por mes.",
  },
] as const;

const BENEFICIOS = [
  "Preguntas Premium extra en cada lección (hasta 9 por lección)",
  "Repetís lecciones sin límite para mejorar tu puntaje",
  "Insignias y desafíos exclusivos",
  "Sin anuncios entre lecciones",
];

// POST /usuarios/{id}/suscripcion { plan, metodo_pago } -> 201
function Premium() {
  const { usuario, activarPremium, cancelarPremium } = useApp();
  const [plan, setPlan] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <header className="card-pop bg-badge/10 p-6">
        <h1 className="text-3xl">
          <Crown className="mr-2 inline size-7 text-badge" />
          Duolingo Premium
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Al confirmar el pago se desbloquean las preguntas extra de todas las lecciones. El estado de
          la suscripción viaja en el perfil del usuario.
        </p>
        {usuario?.premium ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-primary px-3 py-1.5 text-sm font-extrabold text-primary-foreground">
              Suscripción activa
            </span>
            <Button size="sm" variant="outline" onClick={cancelarPremium}>
              Cancelar suscripción
            </Button>
          </div>
        ) : null}
      </header>

      <section className="card-pop p-6">
        <h2 className="text-xl">Qué incluye</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {BENEFICIOS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {PLANES.map((p) => (
          <article key={p.id} className="card-pop flex flex-col p-6">
            <h2 className="text-xl">{p.nombre}</h2>
            <p className="text-display mt-2 text-4xl font-extrabold text-primary">{p.precio}</p>
            <p className="text-sm text-muted-foreground">{p.periodo}</p>
            <p className="mt-2 flex-1 text-sm">{p.detalle}</p>
            <Button
              className="mt-4 shadow-pop"
              disabled={!usuario || usuario.premium}
              onClick={() => setPlan(p.nombre)}
            >
              <CreditCard className="mr-1 size-4" />
              {usuario?.premium ? "Ya sos Premium" : "Pagar y desbloquear"}
            </Button>
          </article>
        ))}
      </section>

      {!usuario ? (
        <p className="text-sm text-muted-foreground">
          <Lock className="mr-1 inline size-4" />
          Necesitás una cuenta para suscribirte.
        </p>
      ) : null}

      <Dialog open={Boolean(plan)} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-display">Pago del plan {plan}</DialogTitle>
            <DialogDescription>
              Checkout de demostración: no se procesa ningún cobro real. Al confirmar se activa Premium
              en tu cuenta.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="tarjeta">Tarjeta</Label>
              <Input id="tarjeta" placeholder="4242 4242 4242 4242" inputMode="numeric" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vto">Vencimiento</Label>
                <Input id="vto" placeholder="12/29" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlan(null)}>
              Cancelar
            </Button>
            <Button
              className="shadow-pop"
              onClick={() => {
                if (plan) activarPremium(plan);
                setPlan(null);
              }}
            >
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
