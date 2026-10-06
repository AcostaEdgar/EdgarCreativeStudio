import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validSession } from "@/lib/admin";
import { hostedStorageReady, readStudioState } from "@/lib/studio-state";
export async function GET() {
  if (!validSession((await cookies()).get("edgar_admin")?.value))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(
      {
        ...(await readStudioState()),
        storage: hostedStorageReady() ? "blob" : "local",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "The collection could not be loaded. Please refresh; your saved work has not been changed.",
      },
      { status: 503 },
    );
  }
}
