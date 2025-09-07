import { type NextRequest, NextResponse } from "next/server"
import { loadSessions, saveSessions } from "../verify/route"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Logout route called")

    const sessionToken = request.cookies.get("auth-token")?.value
    if (sessionToken) {
      const sessions = await loadSessions()
      if (sessions[sessionToken]) {
        delete sessions[sessionToken]
        await saveSessions(sessions)
        console.log("[v0] Session removed from server")
      }
    }

    const response = NextResponse.json({ success: true })

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    console.log("[v0] Logout successful")
    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
