import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["pdf", "docx", "txt", "csv"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 413 }
    );
  }

  const originalName = file.name;
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_TYPES.includes(ext)) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${sanitizedName}`;

  const dir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    file_path: filePath,
    file_name: originalName,
    file_size: file.size,
  });
}
