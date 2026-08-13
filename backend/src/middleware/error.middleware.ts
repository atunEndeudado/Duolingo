import { NextFunction, Request, Response } from 'express'
import { AppError } from '../types/http.js'

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    })
  }

  console.error(error)

  return res.status(500).json({
    message: 'Error interno del servidor',
    code: 'INTERNAL',
    statusCode: 500
  })
}
