import type { NextRequest } from "next/server"

// Simple session storage reference (shared across auth routes)
const activeSessions = new Map<string, { username: string; expires: number }>()

export function verifyAuth(request: NextRequest): { authenticated: boolean; username?: string } {
  try {
    const sessionToken = request.cookies.get("auth-token")?.value

    if (!sessionToken) {
      return { authenticated: false }
    }

    const session = activeSessions.get(sessionToken)

    if (!session || session.expires < Date.now()) {
      // Clean up expired session
      if (session) {
        activeSessions.delete(sessionToken)
      }
      return { authenticated: false }
    }

    return { authenticated: true, username: session.username }
  } catch (error) {
    console.error("[v0] Auth middleware error:", error)
    return { authenticated: false }
  }
}

// Export session storage for consistency across auth routes
export { activeSessions }
