import { create, list, remove, update } from "../repositories/schedules";
import {
  DateRange,
  Schedule,
  ScheduleBody,
  ScheduleWithModificationRecords,
} from "../schema/schedules";

export async function createSchedule(
  schedule: ScheduleBody,
): Promise<ScheduleWithModificationRecords> {
  const createdSchedule = await create(schedule);
  return createdSchedule;
}

export async function deleteSchedule(id: Schedule["id"]): Promise<void> {
  await remove(id);
}

export async function readSchedules(
  dateRange: DateRange,
): Promise<ScheduleWithModificationRecords[]> {
  const schedules = await list(dateRange);
  return schedules;
}

export async function updateSchedule(
  schedule: Schedule,
): Promise<ScheduleWithModificationRecords> {
  const updatedSchedule = await update(schedule);
  return updatedSchedule;
}
