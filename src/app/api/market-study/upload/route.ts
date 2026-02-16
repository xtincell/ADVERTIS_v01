// Market Study File Upload API Route
// POST /api/market-study/upload
// Accepts file uploads, extracts text, and stores in MarketStudy.uploadedFiles.
// Reuses the existing file-parser service.

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { parseFile } from "~/server/services/file-parser";
import type { UploadedFileEntry } from "~/lib/types/market-study";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 },
    );
  }

  const strategyId = formData.get("strategyId") as string | null;
  const file = formData.get("file") as File | null;

  if (!strategyId || !file) {
    return NextResponse.json(
      { error: "strategyId and file are required" },
      { status: 400 },
    );
  }

  // 3. Verify strategy ownership
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    select: { userId: true },
  });

  if (!strategy || strategy.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Strategy not found" },
      { status: 404 },
    );
  }

  // 4. Parse the file
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = await parseFile(buffer, file.name);

    // 5. Store in MarketStudy.uploadedFiles
    let marketStudy = await db.marketStudy.findUnique({
      where: { strategyId },
    });

    if (!marketStudy) {
      marketStudy = await db.marketStudy.create({
        data: {
          strategyId,
          status: "pending",
        },
      });
    }

    const currentFiles =
      (marketStudy.uploadedFiles as UploadedFileEntry[] | null) ?? [];

    const newFile: UploadedFileEntry = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileSize: file.size,
      fileType: parseResult.metadata.fileType,
      extractedText: parseResult.text,
      uploadedAt: new Date().toISOString(),
    };

    currentFiles.push(newFile);

    await db.marketStudy.update({
      where: { strategyId },
      data: {
        uploadedFiles: JSON.parse(JSON.stringify(currentFiles)),
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: newFile.id,
        fileName: newFile.fileName,
        fileSize: newFile.fileSize,
        fileType: newFile.fileType,
        wordCount: parseResult.metadata.wordCount,
      },
    });
  } catch (error) {
    console.error("[MarketStudy Upload] Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during file parsing";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
