import { Router } from 'express'
import { cursoController } from '../controllers/curso.controller.js'

export const cursoRoutes = Router()

cursoRoutes.post('/', cursoController.create.bind(cursoController))
cursoRoutes.post('/:id/lecciones', cursoController.createLesson.bind(cursoController))
cursoRoutes.get('/:id/lecciones', cursoController.getLessons.bind(cursoController))
