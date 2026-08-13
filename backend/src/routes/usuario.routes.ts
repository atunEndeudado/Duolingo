import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.controller.js'

export const usuarioRoutes = Router()

usuarioRoutes.post('/', usuarioController.create.bind(usuarioController))
usuarioRoutes.post('/:id/cursos', usuarioController.enrollCourse.bind(usuarioController))
usuarioRoutes.post('/:id/lecciones/:leccionId/completar', usuarioController.completeLesson.bind(usuarioController))
usuarioRoutes.get('/:id/insignias', usuarioController.getBadges.bind(usuarioController))
usuarioRoutes.post('/:id/amigos', usuarioController.createFriendship.bind(usuarioController))
usuarioRoutes.get('/:id/amigos', usuarioController.getFriends.bind(usuarioController))
usuarioRoutes.get('/:id/ranking-amigos', usuarioController.getRankingAmigos.bind(usuarioController))
usuarioRoutes.get('/:id/cursos/:cursoId/progreso', usuarioController.getCourseProgress.bind(usuarioController))
usuarioRoutes.get('/:id/actividad', usuarioController.getActivity.bind(usuarioController))
