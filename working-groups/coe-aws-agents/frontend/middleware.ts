import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

// If Google OAuth is not configured, skip authentication entirely
const isAuthEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
})

export default isAuthEnabled ? authMiddleware : () => NextResponse.next()

export const config = {
  matcher: [
    "/((?!login|api/auth|api/token|_next/static|_next/image|favicon.ico|icon.svg|link-generated-sound.wav).*)",
  ],
}
