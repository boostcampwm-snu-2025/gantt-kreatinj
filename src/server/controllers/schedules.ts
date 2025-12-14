import { list, remove, update, write } from "../repositories/schedules";
import { DateRange, Schedule, ScheduleBody } from "../schema/schedules";

export async function createSchedule(schedule: ScheduleBody) {
  const createdSchedule = await write(schedule);
  return createdSchedule;
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
  const updatedSchedule = await update(schedule);
  return updatedSchedule;
}
