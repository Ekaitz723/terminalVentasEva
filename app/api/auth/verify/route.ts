import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const VALID_USERS = {
  evatablet: "alberite135",
  dev: "admin00",
}

const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions.json")

async function loadSessions() {
  try {
    await fs.mkdir(path.dirname(SESSIONS_FILE), { recursive: true })
    const data = await fs.readFile(SESSIONS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return {}
  }
}

async function saveSessions(sessions: any) {
  try {
    await fs.mkdir(path.dirname(SESSIONS_FILE), { recursive: true })
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
  } catch (error) {
    console.error("[v0] Error saving sessions:", error)
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Auth verify route called")
    console.log("[v0] All cookies:", request.cookies.getAll())

    const sessionToken = request.cookies.get("auth-token")?.value
    console.log("[v0] Session token found:", !!sessionToken)
    console.log("[v0] Session token value:", sessionToken)

    if (!sessionToken) {
      console.log("[v0] No session token found")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const sessions = await loadSessions()
    console.log("[v0] Available sessions:", Object.keys(sessions))
    const session = sessions[sessionToken]
    console.log("[v0] Session found:", !!session)

    if (!session || session.expires < Date.now()) {
      console.log("[v0] Session expired or invalid")
      if (session) {
        delete sessions[sessionToken]
        await saveSessions(sessions)
      }
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    console.log("[v0] Session verified for user:", session.username)
    return NextResponse.json({
      authenticated: true,
      username: session.username,
    })
  } catch (error) {
    console.error("[v0] Session verification error:", error)
    return NextResponse.json({ authenticated: false, error: "Session error" }, { status: 500 })
  }
}

export { loadSessions, saveSessions }
