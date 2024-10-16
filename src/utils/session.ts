import { getPrisma } from './prisma'
import { cookies } from 'next/headers'
import { AuthUser } from '@/schema'

export const getSession = async (): Promise<AuthUser | null> => {
  const cookieStore = cookies()
  const tokenCookie = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token')
  if (!tokenCookie || !tokenCookie.value) return null
  const user = await getPrisma().user.findFirst({
    where: {
      Session: {
        some: {
          sessionToken: tokenCookie.value,
        },
      },
    },
  })
  return user as AuthUser | null
}

export const getToken = () => {
  const cookieStore = cookies()
  const tokenCookie = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token')
  if (!tokenCookie || !tokenCookie.value) return null

  return tokenCookie.value
}
