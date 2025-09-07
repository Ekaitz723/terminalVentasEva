import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { verifyAuth } from "@/lib/auth-middleware"

const DATA_DIR = path.join(process.cwd(), "data")
const ORDERS_FILE = path.join(DATA_DIR, "orders.json")

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const orderId = Number.parseInt(params.id)

    let orders = []
    try {
      const data = await fs.readFile(ORDERS_FILE, "utf8")
      orders = JSON.parse(data)
    } catch {
      return NextResponse.json({ error: "Orders file not found" }, { status: 404 })
    }

    const filteredOrders = orders.filter((order: any) => order.id !== orderId)
    await fs.writeFile(ORDERS_FILE, JSON.stringify(filteredOrders, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
