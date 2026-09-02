import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleX } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pago-fallido")({ component: PagoFallido });

function PagoFallido() {
  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <CircleX className="mx-auto size-16 text-destructive" />
      <h1 className="text-3xl">No se pudo completar el pago</h1>
      <p className="text-muted-foreground">La operación fue cancelada o rechazada. Podés intentarlo nuevamente.</p>
      <Button asChild><Link to="/premium">Intentar de nuevo</Link></Button>
    </div>
  );
}
