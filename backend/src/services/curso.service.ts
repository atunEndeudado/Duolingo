import { AppError } from '../types/http.js'
import { CursoRepository } from '../repositories/curso.repository.js'
import { z } from 'zod'

const cursoInput = z.object({
  idiomaId: z.string().min(1),
  nivel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1'])
})

const leccionInput = z.object({
  orden: z.number().int().min(1),
  titulo: z.string().min(1),
  xpRecompensa: z.number().int().min(5).max(50)
})

export class CursoService {
  constructor(private readonly repository = new CursoRepository()) {}

  async create(payload: unknown) {
    const input = cursoInput.parse(payload)
    return this.repository.create(input)
  }

  async createLesson(cursoId: string, payload: unknown) {
    const input = leccionInput.parse(payload)

    const curso = await this.repository.getCourseById(cursoId)
    if (!curso) {
      throw new AppError('Curso no encontrado', 404, 'NOT_FOUND')
    }

    return this.repository.addLesson({
      cursoId,
      orden: input.orden,
      titulo: input.titulo,
      xpRecompensa: input.xpRecompensa
    })
  }

  async getLessons(cursoId: string) {
    const curso = await this.repository.getCourseById(cursoId)
    if (!curso) {
      throw new AppError('Curso no encontrado', 404, 'NOT_FOUND')
    }

    return this.repository.getLessonsByCourse(cursoId)
  }
}
