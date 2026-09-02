import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, CreditCard, Lock } from "lucide-react";

import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";
import { createPaymentPreference, type PaymentPlan } from "@/services/paymentService";
import { toast } from "sonner";

export const Route = createFileRoute("/premium")({
  beforeLoad: requireAuth,
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
    id: "mes_1",
    nombre: "Mensual",
    precio: "ARS 4.999",
    periodo: "por mes",
    detalle: "Cancelás cuando quieras.",
  },
  {
    id: "año_1",
    nombre: "Anual",
    precio: "ARS 39.999",
    periodo: "por año",
    detalle: "Acceso Premium durante 12 meses.",
  },
] as const;

const BENEFICIOS = [
  "Preguntas Premium extra en cada lección (hasta 9 por lección)",
  "Repetís lecciones sin límite para mejorar tu puntaje",
  "Insignias y desafíos exclusivos",
  "Sin anuncios entre lecciones",
];

function Premium() {
  const { usuario, cancelarPremium } = useApp();
  const [isStartingPayment, setIsStartingPayment] = useState(false);

  const iniciarPago = async (plan: PaymentPlan) => {
    if (!usuario || isStartingPayment) return;
    setIsStartingPayment(true);
    try {
      const preference = await createPaymentPreference(usuario.id, usuario.email, plan);
      window.location.assign(preference.init_point);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar el pago");
      setIsStartingPayment(false);
    }
  };

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
              disabled={!usuario || usuario.premium || isStartingPayment}
              onClick={() => void iniciarPago(p.id)}
            >
              <CreditCard className="mr-1 size-4" />
              {isStartingPayment ? "Abriendo checkout..." : usuario?.premium ? "Ya sos Premium" : "Pagar y desbloquear"}
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

      <p className="text-center text-xs text-muted-foreground">
        El pago se procesa de forma segura en Mercado Pago. Premium se activa cuando el pago sea aprobado.
      </p>
    </div>
  );
}
