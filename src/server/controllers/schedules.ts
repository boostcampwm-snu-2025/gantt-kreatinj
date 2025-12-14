import { list, remove, write } from "../repositories/schedules";
import { DateRange, Schedule } from "../schema/schedules";

export async function createSchedule(schedule: Omit<Schedule, "id">) {
  const id = Bun.randomUUIDv7();
  const newSchedule: Schedule = {
    ...schedule,
    id,
  };
  await write(newSchedule);
  return newSchedule;
}

export async function deleteSchedule(id: Schedule["id"]) {
  await remove(id);
  return;
}

export async function readSchedules(dateRange: DateRange) {
  const schedules = await list(dateRange);
  return schedules;
}

export async function updateSchedule(schedule: Schedule) {
  await write(schedule);
  return schedule;
}
