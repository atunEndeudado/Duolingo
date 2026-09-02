import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { Idioma, Nivel } from "@/lib/types";

interface AgregarVocabularioProps {
  idiomas: Idioma[];
}

export function AgregarVocabulario({ idiomas }: AgregarVocabularioProps) {
  const [idiomaId, setIdiomaId] = useState(idiomas[0]?.id ?? "");
  const [nivel, setNivel] = useState<Nivel>("A1");
  const [palabra, setPalabra] = useState("");
  const [traduccion, setTraduccion] = useState("");
  const [loading, setLoading] = useState(false);
  const { crearVocabulario } = useApp();

  const NIVELES: Nivel[] = ["A1", "A2", "B1", "B2", "C1"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idiomaId || !palabra.trim() || !traduccion.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const success = await crearVocabulario({
        palabra: palabra.trim(),
        traduccion: traduccion.trim(),
        nivel,
        idioma_id: idiomaId,
      });
      if (success) {
        setPalabra("");
        setTraduccion("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar la palabra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-pop space-y-4 p-6">
      <h2 className="text-xl font-bold">Agregar Palabras al Vocabulario</h2>

      <div className="space-y-2">
        <Label>Idioma</Label>
        <Select value={idiomaId} onValueChange={setIdiomaId}>
          <SelectTrigger>
            <SelectValue placeholder="Elegí un idioma" />
          </SelectTrigger>
          <SelectContent>
            {idiomas.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.nombre} ({i.codigo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Nivel</Label>
        <Select value={nivel} onValueChange={(v) => setNivel(v as Nivel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NIVELES.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="palabra">Palabra</Label>
          <Input
            id="palabra"
            value={palabra}
            onChange={(e) => setPalabra(e.target.value)}
            placeholder="ej: hello"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="traduccion">Traducción</Label>
          <Input
            id="traduccion"
            value={traduccion}
            onChange={(e) => setTraduccion(e.target.value)}
            placeholder="ej: hola"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="shadow-pop">
        {loading ? "Agregando..." : "Agregar Palabra"}
      </Button>
    </form>
  );
}
