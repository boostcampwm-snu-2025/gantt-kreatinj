import { deleteSchedule } from "@/server/controllers/schedules";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteSchedule(id);
  return new Response(null, { status: 204 });
}
