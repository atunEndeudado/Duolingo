import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { AuthService } from "@/services/authService"; // Ajusta la ruta a tu AuthService

export const Route = createFileRoute("/pago-exitoso")({ component: PagoExitoso });

function decodeJwt(token: string): { sub?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function PagoExitoso() {
  const { recargarDatos, activarPremium } = useApp();
  const [activando, setActivando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function procesarPago() {
      // 1. Obtener el ID del usuario directamente del token almacenado
      const token = AuthService.getToken();
      const payload = token ? decodeJwt(token) : null;
      const usuarioId = payload?.sub;

      if (!usuarioId) {
        console.error("No se encontró token o ID de usuario");
        setActivando(false);
        setError(true);
        return;
      }

      try {
        // 2. Activar Premium en FastAPI
        await activarPremium("mensual");
        
        // 3. Forzar refresco global de datos desde la API
        await recargarDatos(usuarioId);
      } catch (err) {
        console.error("Error activando Premium:", err);
        setError(true);
      } finally {
        setActivando(false);
      }
    }

    void procesarPago();
  }, [activarPremium, recargarDatos]);

  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <CheckCircle2 className={`mx-auto size-16 ${error ? "text-destructive" : "text-primary"}`} />
      <h1 className="text-3xl font-bold">{error ? "Hubo un problema" : "¡Pago recibido!"}</h1>
      <p className="text-muted-foreground">
        {activando
          ? "Activando tu suscripción Premium..."
          : error
            ? "No se pudo actualizar tu suscripción automáticamente. Por favor, reinicia sesión o contacta soporte."
            : "¡Tu cuenta ha sido actualizada a Premium exitosamente!"}
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}