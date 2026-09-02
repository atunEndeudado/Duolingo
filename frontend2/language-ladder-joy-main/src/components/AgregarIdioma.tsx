import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

interface AgregarIdiomaProps {
  onIdiomaCreado?: () => void;
}

export function AgregarIdioma({ onIdiomaCreado }: AgregarIdiomaProps) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const { crearIdioma } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !codigo.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const success = await crearIdioma({
        nombre: nombre.trim(),
        codigo: codigo.trim().toLowerCase(),
      });
      if (success) {
        setNombre("");
        setCodigo("");
        onIdiomaCreado?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el idioma");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-pop space-y-4 p-6">
      <h2 className="text-xl font-bold">Nuevo Idioma</h2>
      <p className="text-sm text-muted-foreground">
        Crea nuevos idiomas disponibles para todos los cursos y vocabulario.
      </p>

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del idioma</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej: Francés"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigo">Código (ISO 639-1)</Label>
        <Input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="ej: fr"
          maxLength={5}
          required
        />
        <p className="text-xs text-muted-foreground">
          Código internacional: en, fr, es, pt, de, it, etc.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="shadow-pop">
        {loading ? "Creando..." : "Crear Idioma"}
      </Button>
    </form>
  );
}
