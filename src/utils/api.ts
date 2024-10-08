import { validateSecretHash } from './hash'
import {
  createMiddlewareDecorator,
  createParamDecorator,
  NextFunction,
  NotFoundException,
  UnauthorizedException,
} from 'next-api-decorators'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { envServer } from '@/config/env-server'
import { ProjectAccessKeyRepository, ProjectRepository, UserRepository } from '@/repositories'
import { AuthUser } from '@/schema'

export interface GroupToken {
  server_endpoint: string
  token: string
}

declare module 'next' {
  interface NextApiRequest {
    user: AuthUser
  }
}

export interface ApiResponse<T> {
  status: boolean
  data?: T
  error?: string
  message?: string
}

export function success<T>(data: T): ApiResponse<T> {
  return { status: true, data }
}

export function error(error: string, message?: string): ApiResponse<any> {
  return { status: false, error, message }
}

export const SessionUser = createParamDecorator<AuthUser>((req) => req.user)
export const SessionUserId = createParamDecorator<string>((req) => (req as any).userId)
export const ProjectId = createParamDecorator<string>((req) => req.query.projectId as string)

export function ApiExceptionHandler(error: unknown, req: NextApiRequest, res: NextApiResponse) {
  const errorStr = error instanceof Error ? error.message : 'An unknown error occurred.'
  res.status(200).json({ status: false, error: errorStr })
}

export const NextAuthGuard = createMiddlewareDecorator(
  async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    const token = await getToken({ req, secret: envServer.NEXTAUTH_SECRET })
    // console.log('token', token)
    if (token) {
      ;(req as any).userId = (token as any).user.id
      ;(req as any).user = (token as any).user
      return next()
    }

    if (req.headers['api-key'] && req.headers['secret-key']) {
      const apiKey = req.headers['api-key'] as string
      const secretKey = req.headers['secret-key'] as string

      console.log('apiKey', apiKey)
      console.log('secretKey', secretKey)

      const keyEntity = await ProjectAccessKeyRepository.Instance.detail({
        apiKey,
      })

      if (!keyEntity) {
        // console.log('key not found')
        throw new UnauthorizedException('Unauthorized')
      }

      const isValid = validateSecretHash(keyEntity.secretKey!, secretKey)
      if (!isValid) {
        // console.log('secret is not valid')
        throw new UnauthorizedException('Unauthorized')
      }

      const user = await UserRepository.Instance.get({ id: keyEntity.userId })
      if (!user) {
        // console.log('user not found')
        throw new UnauthorizedException('Unauthorized')
      }

      ;(req as any).userId = keyEntity.userId
      ;(req as any).user = user
      return next()
    }

    throw new UnauthorizedException('Unauthorized')
  }
)

export const ProjectGuard = createMiddlewareDecorator(
  async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    const projectId = req.query.projectId as string
    const userId = (req as any).userId

    const project = await ProjectRepository.Instance.detail({ id: projectId, userId })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return next()
  }
)
