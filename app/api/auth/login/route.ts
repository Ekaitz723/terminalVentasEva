import { type NextRequest, NextResponse } from "next/server"
import { loadSessions, saveSessions } from "../verify/route"

const VALID_USERS = {
  evatablet: "alberite135",
  dev: "admin00",
}

// Generate simple session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login route called")

    const { username, password } = await request.json()
    console.log("[v0] Login attempt for username:", username)

    // Validate credentials
    if (
      !VALID_USERS[username as keyof typeof VALID_USERS] ||
      VALID_USERS[username as keyof typeof VALID_USERS] !== password
    ) {
      console.log("[v0] Invalid credentials for user:", username)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generate session token
    const sessionToken = generateSessionToken()
    const expires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    const sessions = await loadSessions()
    sessions[sessionToken] = { username, expires }
    await saveSessions(sessions)
    console.log("[v0] Session created and saved for user:", username)
    console.log("[v0] Session token generated:", sessionToken)

    const response = NextResponse.json({
      success: true,
      username: username,
    })

    response.cookies.set("auth-token", sessionToken, {
      httpOnly: false, // Allow JavaScript access for debugging
      secure: false, // Work on HTTP and HTTPS
      sameSite: "lax", // Changed from "none" to "lax" - "none" requires secure=true
      maxAge: 30 * 24 * 60 * 60, // 30 days instead of 24 hours
      path: "/", // Available for all paths
      domain: undefined, // Let browser decide the domain
    })

    console.log("[v0] Cookie set with token:", sessionToken)
    console.log("[v0] Cookie attributes: httpOnly=false, secure=false, sameSite=lax, maxAge=30days") // Updated log message
    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 })
  }
}
