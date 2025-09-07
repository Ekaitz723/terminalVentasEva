import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "jpg"
    const filename = `item_${timestamp}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Convertir archivo a buffer y guardarlo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Retornar la ruta relativa para usar en el frontend
    const imagePath = `/uploads/${filename}`

    return NextResponse.json({ imagePath })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 })
  }
}
