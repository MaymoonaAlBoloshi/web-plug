import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { updateDb } from "@/lib/store";

const schema = z.object({ id: z.string(), status: z.enum(["open", "resolved"]).optional(), remove: z.boolean().optional() });

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user?.tenantId || user.role !== "customer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const changed = await updateDb(db => {
    const index = db.supportRequests.findIndex(item => item.id === parsed.data.id && item.tenantId === user.tenantId);
    if (index < 0) return false;
    if (parsed.data.remove) db.supportRequests.splice(index, 1);
    else if (parsed.data.status) db.supportRequests[index].status = parsed.data.status;
    return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Request not found" }, { status: 404 });
}
