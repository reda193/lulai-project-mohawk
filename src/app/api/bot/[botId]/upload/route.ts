import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  try {
    // Parse formData directly from request
    const formData = await req.formData()
    
    // Get the file from formData
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ 
        error: "No file uploaded" 
      }, { status: 400 })
    }

    // Log file details
    console.log('Received file:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Convert file to array buffer then to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    // Set up upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await require('fs/promises').mkdir(uploadDir, { recursive: true })
    
    // Save file
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      type: file.type,
      size: file.size
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: "Upload failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}