import { getToken } from "next-auth/jwt"
import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // If auth is not configured, return empty token (backend will run in dev mode)
  if (!process.env.NEXTAUTH_SECRET || !process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ token: "" })
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  if (!token?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const accessToken = jwt.sign(
    { email: token.email },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: "1h" }
  )

  return NextResponse.json({ token: accessToken })
}
