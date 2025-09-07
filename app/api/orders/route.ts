import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { verifyAuth } from "@/lib/auth-middleware"

const DATA_DIR = path.join(process.cwd(), "data")
const ORDERS_FILE = path.join(DATA_DIR, "orders.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

export async function GET(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await ensureDataDir()

    try {
      const data = await fs.readFile(ORDERS_FILE, "utf8")
      return NextResponse.json(JSON.parse(data))
    } catch {
      // File doesn't exist, return empty array
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("Error reading orders:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await ensureDataDir()
    const newOrder = await request.json()

    let orders = []
    try {
      const data = await fs.readFile(ORDERS_FILE, "utf8")
      orders = JSON.parse(data)
    } catch {
      // File doesn't exist, start with empty array
    }

    orders.push(newOrder)
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving order:", error)
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 })
  }
}
