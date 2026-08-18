import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || ''

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          ...(ALLOWED_DOMAIN ? { hd: ALLOWED_DOMAIN } : {}),
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!ALLOWED_DOMAIN) return true // No domain restriction
      return user.email?.endsWith(`@${ALLOWED_DOMAIN}`) ?? false
    },
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
      }
      // Pass the raw JWT sub and email so frontend can create auth header
      ;(session as any).accessToken = token.jti || token.sub || ''
      ;(session as any).userEmail = token.email
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
