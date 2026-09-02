import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pago-exitoso")({ component: PagoExitoso });

function PagoExitoso() {
  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-16 text-primary" />
      <h1 className="text-3xl">Pago recibido</h1>
      <p className="text-muted-foreground">
        Mercado Pago confirmó tu operación. Premium se activará cuando el backend procese la notificación.
      </p>
      <Button asChild><Link to="/">Volver al inicio</Link></Button>
    </div>
  );
}
