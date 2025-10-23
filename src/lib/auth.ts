import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Hardcoded admin credentials (in production, this would come from a database)
        const adminUsername = "adminfisioactiva"
        const adminPassword = "Fisioprocevia#2025"

        if (credentials.username === adminUsername && credentials.password === adminPassword) {
          return {
            id: "admin",
            name: "Admin FisioActiva",
            email: "admin@fisioactiva.com",
            role: "admin"
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      if (token?.role) {
        session.user.role = token.role
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
