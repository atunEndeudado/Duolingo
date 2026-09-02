import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AuthService } from "@/services/authService";
import * as api from "./api";
import { dbInicial, type DB } from "./mock-db";
import type { Nivel, Usuario } from "./types";

interface AppContextValue {
  db: DB;
  usuario: Usuario | null;
  registrar: (body: { email: string; nombre: string; password: string }) => Promise<boolean>;
  inscribirse: (curso_id: string) => void;
  crearCurso: (body: { idioma_id: string; nivel: Nivel }) => Promise<boolean>;
  crearLeccion: (body: {
    curso_id: string;
    orden: number;
    titulo: string;
    xp_recompensa: number;
  }) => Promise<boolean>;
  completarLeccion: (leccion_id: string, puntaje: number) => void;
  activarPremium: (plan: string) => void;
  cancelarPremium: () => void;
  enviarSolicitud: (amigo_id: string) => void;
  responderSolicitud: (solicitud_id: string, acepta: boolean) => void;
  cancelarSolicitud: (solicitud_id: string) => void;
  eliminarAmigo: (amigo_id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function decodeJwtPayload(token: string): { sub?: string; email?: string; nombre?: string; es_admin?: boolean } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(dbInicial);
  const token = AuthService.getToken();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [idiomas, cursos] = await Promise.all([
          api.listarIdiomas(),
          Promise.all([
            api.listarCursosPorIdioma("1"),
            api.listarCursosPorIdioma("2"),
            api.listarCursosPorIdioma("3"),
          ])
            .then((res) => res.flat())
            .catch(() => []),
        ]);

        setDb((prev) => ({
          ...prev,
          idiomas,
          cursos,
        }));
      } catch {
        setDb((prev) => ({ ...prev, idiomas: [], cursos: [] }));
      }
    };

    void cargarDatos();
  }, []);

  const usuario = useMemo(() => {
    const usuarioDb = db.usuarios.find((u) => u.id === db.usuario_actual) ?? null;
    if (usuarioDb) return usuarioDb;

    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload?.email) return null;

    return {
      id: String(payload.sub ?? "me"),
      email: String(payload.email),
      nombre: String(payload.nombre ?? payload.email.split("@")[0]),
      xp_total: 0,
      racha_dias: 0,
      fecha_ultima_actividad: null,
      premium: false,
      es_admin: payload.es_admin ?? false,
    } satisfies Usuario;
  }, [db.usuarios, db.usuario_actual, token]);

  const registrar = useCallback(async (body: { email: string; nombre: string; password: string }) => {
    try {
      const usuarioCreado = await api.crearUsuarioBackend(body);
      setDb((prev) => ({
        ...prev,
        usuarios: [...prev.usuarios, usuarioCreado],
        usuario_actual: usuarioCreado.id,
      }));
      toast.success(`¡Bienvenido/a, ${usuarioCreado.nombre}!`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar");
      return false;
    }
  }, []);

  const inscribirse = useCallback(
    (curso_id: string) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.inscribirse(prev, usuario.id, curso_id);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        toast.success("Inscripción confirmada");
        return res.data.db;
      });
    },
    [usuario],
  );

  const crearCurso = useCallback(async (body: { idioma_id: string; nivel: Nivel }) => {
    try {
      const curso = await api.crearCursoBackend(body);
      setDb((prev) => ({
        ...prev,
        cursos: [...prev.cursos, curso],
      }));
      toast.success("Curso creado");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el curso");
      return false;
    }
  }, []);

  const crearLeccion = useCallback(
    async (body: { curso_id: string; orden: number; titulo: string; xp_recompensa: number }) => {
      try {
        const leccion = await api.crearLeccionBackend(body);
        setDb((prev) => ({
          ...prev,
          lecciones: [...prev.lecciones, leccion],
        }));
        toast.success("Lección creada");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo crear la lección");
        return false;
      }
    },
    [],
  );

  const completarLeccion = useCallback(
    (leccion_id: string, puntaje: number) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.completarLeccion(prev, usuario.id, leccion_id, puntaje);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        const { completada, xp_ganado, insignias_nuevas } = res.data;
        if (completada) {
          toast.success(
            xp_ganado > 0 ? `¡Lección completada! +${xp_ganado} XP` : "¡Lección completada de nuevo!",
          );
        } else {
          toast.error(`Puntaje ${puntaje}: necesitás 60 para aprobar. Podés reintentar.`);
        }
        for (const i of insignias_nuevas) {
          toast.success(`${i.icono} Insignia desbloqueada: ${i.nombre}`);
        }
        return res.data.db;
      });
    },
    [usuario],
  );

  const activarPremium = useCallback(
    (plan: string) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.activarPremium(prev, usuario.id);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        toast.success(`Pago aprobado · plan ${plan}. ¡Preguntas Premium desbloqueadas!`);
        return res.data.db;
      });
    },
    [usuario],
  );

  const cancelarPremium = useCallback(() => {
    if (!usuario) return;
    setDb((prev) => api.cancelarPremium(prev, usuario.id));
    toast.info("Suscripción cancelada");
  }, [usuario]);

  const enviarSolicitud = useCallback(
    (amigo_id: string) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.enviarSolicitud(prev, usuario.id, amigo_id);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        toast.success("Solicitud enviada. Queda pendiente hasta que la acepte.");
        return res.data.db;
      });
    },
    [usuario],
  );

  const responderSolicitud = useCallback((solicitud_id: string, acepta: boolean) => {
    setDb((prev) => {
      const res = api.responderSolicitud(prev, solicitud_id, acepta);
      if (!res.ok) {
        toast.error(res.error);
        return prev;
      }
      toast.success(acepta ? "¡Ahora son amigos!" : "Solicitud rechazada");
      return res.data.db;
    });
  }, []);

  const cancelarSolicitud = useCallback((solicitud_id: string) => {
    setDb((prev) => api.cancelarSolicitud(prev, solicitud_id));
    toast.info("Solicitud cancelada");
  }, []);

  const eliminarAmigo = useCallback(
    (amigo_id: string) => {
      if (!usuario) return;
      setDb((prev) => api.eliminarAmigo(prev, usuario.id, amigo_id));
    },
    [usuario],
  );

  const value: AppContextValue = {
    db,
    usuario,
    registrar,
    inscribirse,
    crearCurso,
    crearLeccion,
    completarLeccion,
    activarPremium,
    cancelarPremium,
    enviarSolicitud,
    responderSolicitud,
    cancelarSolicitud,
    eliminarAmigo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
