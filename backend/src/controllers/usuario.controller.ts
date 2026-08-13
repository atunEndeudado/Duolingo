import { Request, Response, NextFunction } from 'express'
import { UsuarioService } from '../services/usuario.service.js'

const usuarioService = new UsuarioService()

export class UsuarioController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await usuarioService.create(req.body)
      res.status(201).json(usuario)
    } catch (error) {
      next(error)
    }
  }

  async enrollCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.enrollCourse(req.params.id, req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async completeLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.completeLesson(req.params.id, req.params.leccionId, req.body)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.getBadges(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async createFriendship(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.createFriendship(req.params.id, req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.getFriends(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getRankingAmigos(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.getRankingAmigos(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getCourseProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.getCourseProgress(req.params.id, req.params.cursoId)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usuarioService.getActivity(req.params.id, req.query)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}

export const usuarioController = new UsuarioController()
