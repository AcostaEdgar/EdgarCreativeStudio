import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sameOrigin, validSession } from "@/lib/admin";
import { blobToken } from "@/lib/studio-state";

export async function POST(request: Request) {
  const token = blobToken();
  if (!token) return NextResponse.json({ error: "Online storage is not connected." }, { status: 503 });
  const body = await request.json() as HandleUploadBody;
  if (body.type === "blob.generate-client-token" &&
      (!sameOrigin(request) || !validSession((await cookies()).get("edgar_admin")?.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async pathname => {
        if (!pathname.startsWith("studio/uploads/")) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Upload could not be completed." }, { status: 400 });
  }
}
