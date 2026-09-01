import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { redirectIfAuthenticated } from "@/lib/routeGuards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: redirectIfAuthenticated,
  head: () => ({
    meta: [
      { title: "Iniciar sesión — tuboLingo" },
      {
        name: "description",
        content: "Ingresá tu email y contraseña para acceder a tus cursos.",
      },
      { property: "og:title", content: "Iniciar sesión — tuboLingo" },
      { property: "og:description", content: "Inicia sesión en tuboLingo" },
    ],
  }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      setEmail("");
      setPassword("");
      navigate({ to: "/" });
    } catch {
      // Error is already handled by toast in authContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Iniciá sesión</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresá tus credenciales para acceder a tu cuenta.
      </p>

      <form className="card-pop mt-6 space-y-4 p-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />
        </div>
        <Button type="submit" className="w-full shadow-pop" disabled={isSubmitting}>
          {isSubmitting ? "Cargando..." : "Iniciar sesión"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link to="/registro" className="font-semibold text-primary hover:underline">
          Registrate aquí
        </Link>
      </div>
    </div>
  );
}
