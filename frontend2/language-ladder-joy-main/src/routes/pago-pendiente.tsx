import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pago-pendiente")({ component: PagoPendiente });

function PagoPendiente() {
  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <Clock3 className="mx-auto size-16 text-badge" />
      <h1 className="text-3xl">Pago pendiente</h1>
      <p className="text-muted-foreground">
        Mercado Pago todavía está verificando la operación. Premium se activará cuando el pago sea aprobado.
      </p>
      <Button asChild><Link to="/premium">Volver a Premium</Link></Button>
    </div>
  );
}
