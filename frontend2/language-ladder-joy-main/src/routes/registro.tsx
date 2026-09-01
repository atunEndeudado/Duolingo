import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

import { useApp } from "@/lib/store";
import { redirectIfAuthenticated } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/registro")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({
    meta: [
      { title: "Crear cuenta — Duolingo" },
      {
        name: "description",
        content: "Registrate con tu email para inscribirte a cursos y empezar a acumular XP.",
      },
      { property: "og:title", content: "Crear cuenta — Duolingo" },
      { property: "og:description", content: "Registrate y empezá a aprender idiomas." },
    ],
  }),
  component: Registro,
});

// HU1 — Registro: POST /usuarios -> 201. Email único, xp_total y racha_dias en 0.
function Registro() {
  const { registrar } = useApp();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl">Creá tu cuenta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Arrancás con 0 XP y 0 días de racha. El email debe ser único.
      </p>

      <form
        className="card-pop mt-6 space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await registrar({ nombre, email, password })) {
            setNombre("");
            setEmail("");
            setPassword("");
            navigate({ to: "/cursos" });
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full shadow-pop">
          Registrarme
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Iniciá sesión aquí
        </Link>
      </div>
    </div>
  );
}
