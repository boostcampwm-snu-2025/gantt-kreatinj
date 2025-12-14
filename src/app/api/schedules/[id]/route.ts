import { deleteSchedule, updateSchedule } from "@/server/controllers/schedules";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteSchedule(id);
  return new Response(null, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  await updateSchedule({ ...body, id });
  return new Response(null, { status: 200 });
}
