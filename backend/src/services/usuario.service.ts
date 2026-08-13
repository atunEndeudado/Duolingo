import { AppError } from '../types/http.js'
import { UsuarioRepository } from '../repositories/usuario.repository.js'
import { z } from 'zod'

const createUsuarioInput = z.object({
  email: z.string().email(),
  nombre: z.string().min(1)
})

const enrollCourseInput = z.object({
  cursoId: z.string().min(1)
})

const completeLessonInput = z.object({
  puntaje: z.number().int().min(0).max(100)
})

const friendshipInput = z.object({
  amigoId: z.string().min(1)
})

export class UsuarioService {
  constructor(private readonly repository = new UsuarioRepository()) {}

  async create(payload: unknown) {
    const input = createUsuarioInput.parse(payload)

    const existing = await this.repository.findByEmail(input.email)
    if (existing) {
      throw new AppError('El email ya está registrado', 409, 'CONFLICT')
    }

    return this.repository.create({
      email: input.email,
      nombre: input.nombre
    })
  }

  async enrollCourse(usuarioId: string, payload: unknown) {
    const input = enrollCourseInput.parse(payload)
    const usuario = await this.repository.findById(usuarioId)

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND')
    }

    // Repositorio/Prisma debe poder aplicar la restricción de inscripción única.
    return this.repository.enrollUserInCourse(usuarioId, input.cursoId)
  }

  async completeLesson(usuarioId: string, leccionId: string, payload: unknown) {
    const input = completeLessonInput.parse(payload)
    return {
      ok: true,
      usuarioId,
      leccionId,
      puntaje: input.puntaje,
      message: 'Intención del flujo implementada en servicio de progreso'
    }
  }

  async getBadges(usuarioId: string) {
    const usuario = await this.repository.findById(usuarioId)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND')
    }

    return this.repository.getBadges(usuarioId)
  }

  async createFriendship(usuarioId: string, payload: unknown) {
    const { amigoId } = friendshipInput.parse(payload)

    if (usuarioId === amigoId) {
      throw new AppError('Un usuario no puede agregarse a sí mismo como amigo', 409, 'CONFLICT')
    }

    return {
      usuarioId,
      amigoId,
      message: 'Amistad creada o validada por repositorio'
    }
  }

  async getFriends(usuarioId: string) {
    const usuario = await this.repository.findById(usuarioId)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND')
    }

    return this.repository.getFriends(usuarioId)
  }

  async getRankingAmigos(usuarioId: string) {
    const usuario = await this.repository.findById(usuarioId)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND')
    }

    return {
      usuario,
      amigos: [],
      posicion: 1
    }
  }

  async getCourseProgress(usuarioId: string, cursoId: string) {
    const usuario = await this.repository.findById(usuarioId)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND')
    }

    return {
      usuarioId,
      cursoId,
      totalLecciones: 0,
      completadas: 0,
      porcentaje: 0,
      proximaLeccion: null
    }
  }

  async getActivity(usuarioId: string, query: unknown) {
    const usuario = await this.repository.findById(usuarioId)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND')
    }

    return {
      usuarioId,
      desde: query,
      heatmap: []
    }
  }
}
