import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { envServer } from '@/config/env-server'
import { getPrisma } from '@/utils/prisma'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrisma()),
  secret: envServer.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: envServer.GOOGLE_CLIENT_ID,
      clientSecret: envServer.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: envServer.GITHUB_ID,
      clientSecret: envServer.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    session: async ({ user, session }: any) => {
      if (user) {
        session.user.role = user.role
        session.user.status = user.status
        session.user.id = user.id
      }
      return session
    },
  },
}

export default NextAuth(authOptions)