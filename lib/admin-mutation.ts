import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sameOrigin, validSession } from "./admin";
import { mutateStudioState } from "./studio-state";
import type { StudioState } from "./studio-types";
export async function authorize(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!validSession((await cookies()).get("edgar_admin")?.value))
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 },
    );
}
export async function publish(change: (state: StudioState) => void) {
  try {
    const state = await mutateStudioState(change);
    ["/", "/gallery", "/work", "/writing"].forEach((p) => revalidatePath(p));
    return NextResponse.json(
      { ok: true, ...state },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save. Please retry.",
      },
      { status: 409 },
    );
  }
}
