import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AuthService } from "@/services/authService";
import * as api from "./api";
import { dbInicial, type DB } from "./mock-db";
import type { DireccionPregunta, Nivel, Usuario } from "./types";

interface AppContextValue {
  db: DB;
  usuario: Usuario | null;
  registrar: (body: { email: string; nombre: string; password: string }) => Promise<boolean>;
  inscribirse: (curso_id: string) => void;
  crearCurso: (body: { idioma_id: string; nivel: Nivel }) => Promise<boolean>;
  eliminarCurso: (cursoId: string) => Promise<boolean>;
  crearLeccion: (body: {
    curso_id: string;
    orden: number;
    titulo: string;
    xp_recompensa: number;
  }) => Promise<boolean>;
  eliminarLeccion: (leccionId: string) => Promise<boolean>;
  crearInsignia: (body: {
    nombre: string;
    descripcion?: string;
    variable: "racha" | "cantidad_amigos" | "xp_total" | "xp_dia";
    valor: number;
  }) => Promise<boolean>;
  eliminarInsignia: (insigniaId: string) => Promise<boolean>;
  crearIdioma: (body: { nombre: string; codigo: string }) => Promise<boolean>;
  crearVocabulario: (body: {
    palabra: string;
    traduccion: string;
    nivel: Nivel;
    idioma_id: string;
  }) => Promise<boolean>;
  crearPregunta: (body: {
    leccion_id: string;
    pregunta: string;
    respuesta?: string;
    tipo: "traducir" | "unir_palabras" | "unir_oraciones";
    direccion: DireccionPregunta;
    es_premium: boolean;
  }) => Promise<boolean>;
  recargarDatos: (usuarioId?: string) => Promise<void>;
  completarLeccion: (leccion_id: string, puntaje: number) => Promise<boolean>;
  activarPremium: (plan: string) => void;
  cancelarPremium: () => void;
  enviarSolicitud: (amigo_id: string) => void;
  responderSolicitud: (solicitud_id: string, acepta: boolean) => void;
  cancelarSolicitud: (solicitud_id: string) => void;
  eliminarAmigo: (amigo_id: string) => void;
  buscarUsuarios: (query: string) => Promise<Usuario[]>;
  obtenerSugerencias: (usuario_id: string) => Promise<Usuario[]>;
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

  const recargarDatos = useCallback(async (usuarioId?: string) => {
    const idiomas = await api.listarIdiomas();
    const idiomasUnicos = [...new Map(idiomas.map((idioma) => [idioma.codigo.toLowerCase(), idioma])).values()];
    const cursos = (await Promise.all(idiomasUnicos.map((idioma) => api.listarCursosPorIdioma(idioma.id)))).flat();
    const cursosUnicos = [...new Map(cursos.map((curso) => [curso.id, curso])).values()];
    const lecciones = (
      await Promise.all(cursosUnicos.map((curso) => api.listarLeccionesPorCurso(curso.id, usuarioId)))
    ).flat();
    const leccionesUnicas = [...new Map(lecciones.map((leccion) => [leccion.id, leccion])).values()];
    const insignias = await api.listarInsigniasBackend();
    let perfil: Usuario | null = null;
    let progresos = [] as DB["progresos"];
    let usuarioInsignias = [] as DB["usuario_insignias"];
    if (usuarioId) {
      try {
        [perfil, progresos, usuarioInsignias] = await Promise.all([
          api.obtenerUsuarioBackend(usuarioId),
          api.listarProgresoPorUsuario(usuarioId),
          api.listarInsigniasUsuarioBackend(usuarioId),
        ]);
      } catch {
        // El catálogo no depende de que el perfil esté disponible en este momento.
      }
    }

    setDb((prev) => ({
      ...prev,
      idiomas: idiomasUnicos,
      cursos: cursosUnicos,
      lecciones: leccionesUnicas,
      insignias,
      usuario_insignias: usuarioInsignias,
      progresos,
      usuarios: perfil ? [...prev.usuarios.filter((item) => item.id !== perfil.id), perfil] : prev.usuarios,
      usuario_actual: perfil?.id ?? prev.usuario_actual,
    }));
  }, []);

  useEffect(() => {
    const usuarioId = decodeJwtPayload(token ?? "")?.sub;
    void recargarDatos(usuarioId).catch(() => {
        setDb((prev) => ({ ...prev, idiomas: [], cursos: [] }));
    });
  }, [recargarDatos, token]);

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

  const eliminarCurso = useCallback(async (cursoId: string) => {
    try {
      await api.eliminarCurso(cursoId);
      setDb((prev) => ({
        ...prev,
        cursos: prev.cursos.filter((curso) => curso.id !== cursoId),
        lecciones: prev.lecciones.filter((leccion) => leccion.curso_id !== cursoId),
        usuario_cursos: prev.usuario_cursos.filter((inscripcion) => inscripcion.curso_id !== cursoId),
      }));
      toast.success("Curso eliminado");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el curso");
      return false;
    }
  }, []);

  const eliminarLeccion = useCallback(async (leccionId: string) => {
    try {
      await api.eliminarLeccion(leccionId);
      setDb((prev) => ({
        ...prev,
        lecciones: prev.lecciones.filter((leccion) => leccion.id !== leccionId),
        preguntas: prev.preguntas.filter((pregunta) => pregunta.leccion_id !== leccionId),
        progresos: prev.progresos.filter((progreso) => progreso.leccion_id !== leccionId),
      }));
      toast.success("Lección eliminada");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la lección");
      return false;
    }
  }, []);

  const crearInsignia = useCallback(async (body: {
    nombre: string;
    descripcion?: string;
    variable: "racha" | "cantidad_amigos" | "xp_total" | "xp_dia";
    valor: number;
  }) => {
    try {
      const insignia = await api.crearInsigniaBackend(body);
      setDb((prev) => ({ ...prev, insignias: [...prev.insignias, insignia] }));
      toast.success("Insignia creada");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la insignia");
      return false;
    }
  }, []);

  const eliminarInsignia = useCallback(async (insigniaId: string) => {
    try {
      await api.eliminarInsignia(insigniaId);
      setDb((prev) => ({
        ...prev,
        insignias: prev.insignias.filter((insignia) => insignia.id !== insigniaId),
        usuario_insignias: prev.usuario_insignias.filter((item) => item.insignia_id !== insigniaId),
      }));
      toast.success("Insignia eliminada");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la insignia");
      return false;
    }
  }, []);

  const crearIdioma = useCallback(
    async (body: { nombre: string; codigo: string }) => {
      try {
        const idioma = await api.crearIdiomaBackend(body);
        await recargarDatos();
        toast.success("Idioma creado");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo crear el idioma");
        return false;
      }
    },
    [recargarDatos],
  );

  const completarLeccion = useCallback(
    async (leccion_id: string, puntaje: number) => {
      if (!usuario) return false;
      try {
        await api.registrarProgresoBackend({
          usuario_id: usuario.id,
          leccion_id,
          puntaje,
          completada: puntaje >= 60,
        });
        await recargarDatos(usuario.id);
        toast.success(
          puntaje >= 60 ? "¡Lección completada!" : `Puntaje ${puntaje}: necesitás 60 para aprobar.`,
        );
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo guardar el progreso");
        return false;
      }
    },
    [recargarDatos, usuario],
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

  const buscarUsuarios = useCallback((query: string) => api.buscarUsuariosBackend(query), []);

  const obtenerSugerencias = useCallback(
    (usuario_id: string) => api.obtenerSugerenciasBackend(usuario_id),
    [],
  );

  const crearVocabulario = useCallback(
    async (body: {
      palabra: string;
      traduccion: string;
      nivel: Nivel;
      idioma_id: string;
    }) => {
      try {
        const vocabulario = await api.crearVocabularioBackend(body);
        setDb((prev) => ({
          ...prev,
          vocabulario: [...prev.vocabulario, vocabulario],
        }));
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo agregar la palabra");
        return false;
      }
    },
    [],
  );

  const crearPregunta = useCallback(
    async (body: {
      leccion_id: string;
      pregunta: string;
      respuesta?: string;
      tipo: "traducir" | "unir_palabras" | "unir_oraciones";
      direccion: DireccionPregunta;
      es_premium: boolean;
    }) => {
      try {
        const pregunta = await api.crearPreguntaBackend(body);
        setDb((prev) => ({
          ...prev,
          preguntas: [...prev.preguntas, pregunta],
        }));
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo agregar la pregunta");
        return false;
      }
    },
    [],
  );

  const value: AppContextValue = {
    db,
    usuario,
    registrar,
    inscribirse,
    crearCurso,
    eliminarCurso,
    crearLeccion,
    eliminarLeccion,
    crearInsignia,
    eliminarInsignia,
    crearIdioma,
    completarLeccion,
    activarPremium,
    cancelarPremium,
    enviarSolicitud,
    responderSolicitud,
    cancelarSolicitud,
    eliminarAmigo,
    buscarUsuarios,
    obtenerSugerencias,
    crearVocabulario,
    crearPregunta,
    recargarDatos,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
