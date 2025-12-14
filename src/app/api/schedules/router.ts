import { NextRequest } from "next/server";

import { createSchedule, readSchedules } from "@/server/controllers/schedules";
import { dateRangeSchema, scheduleBodySchema } from "@/server/schema/schedules";

export async function GET(request: NextRequest) {
  const rawStartDate = request.nextUrl.searchParams.get("startDate");
  const rawEndDate = request.nextUrl.searchParams.get("endDate");
  if (!rawStartDate || !rawEndDate) {
    return new Response(null, { status: 400, statusText: "Missing startDate or endDate parameter" });
  }
  const dateRange = dateRangeSchema.parse([rawStartDate, rawEndDate]);
  const schedules = await readSchedules(dateRange);
  return new Response(JSON.stringify({ schedules }), { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const scheduleBody = scheduleBodySchema.parse(body);
  const schedule = await createSchedule(scheduleBody);
  return new Response(JSON.stringify({ schedule }), { status: 201 });
}
