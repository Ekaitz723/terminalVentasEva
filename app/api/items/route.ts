import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { verifyAuth } from "@/lib/auth-middleware"

const DATA_DIR = path.join(process.cwd(), "data")
const ITEMS_FILE = path.join(DATA_DIR, "items.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Default items data
const defaultItems = {
  items: [
    { id: 1, name: "Coffee", price: 3.5, photo: "/coffee-cup.png", number: "001" },
    { id: 2, name: "Sandwich", price: 8.99, photo: "/classic-sandwich.png", number: "002" },
    { id: 3, name: "Salad", price: 12.5, photo: "/fresh-salad.png", number: "003" },
    { id: 4, name: "Juice", price: 4.25, photo: "/glass-of-orange-juice.png", number: "004" },
    { id: 5, name: "Pastry", price: 5.75, photo: "/assorted-pastries.png", number: "005" },
    { id: 6, name: "Tea", price: 2.99, photo: "/elegant-tea-cup.png", number: "006" },
  ],
  nextItemId: 7,
}

export async function GET(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await ensureDataDir()

    try {
      const data = await fs.readFile(ITEMS_FILE, "utf8")
      return NextResponse.json(JSON.parse(data))
    } catch {
      // File doesn't exist, return default items
      await fs.writeFile(ITEMS_FILE, JSON.stringify(defaultItems, null, 2))
      return NextResponse.json(defaultItems)
    }
  } catch (error) {
    console.error("Error reading items:", error)
    return NextResponse.json(defaultItems)
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await ensureDataDir()
    const data = await request.json()

    await fs.writeFile(ITEMS_FILE, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving items:", error)
    return NextResponse.json({ error: "Failed to save items" }, { status: 500 })
  }
}
