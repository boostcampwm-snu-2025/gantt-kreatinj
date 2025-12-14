import dayjs from "dayjs";
import { readdir } from "node:fs/promises";

import type { DateRange, Schedule, ScheduleWithModificationRecords } from "@/server/schema/schedules";

import { scheduleWithModificationRecordsSchema } from "@/server/schema/schedules";

const DATA_PATH = "./src/server/data/";
const FILE_EXTENSION = ".json";

// export async function exists(id: Schedule["id"]): Promise<boolean> {
//   const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
//   const file = Bun.file(path);
//   return await file.exists();
// }

export async function list(range: DateRange): Promise<ScheduleWithModificationRecords[]> {
  const rangeStart = dayjs(range[0]);
  const rangeEnd = dayjs(range[1]);

  const files = await readdir(DATA_PATH);
  const allSchedules = await Promise.all(files.map(async (file) => {
    const id = file.replace(FILE_EXTENSION, "");
    const schedule = await read(id);
    return schedule;
  }));

  const schedules = allSchedules.filter((schedule) => {
    const start = dayjs(schedule.startDate);
    const end = dayjs(schedule.endDate);

    const isStartBetweenRange = rangeStart.valueOf() <= start.valueOf() && start.valueOf() < rangeEnd.valueOf();
    const isEndBetweenRange = rangeStart.valueOf() < end.valueOf() && end.valueOf() < rangeEnd.valueOf();
    const isScheduleEncompassesRange = start.valueOf() < rangeStart.valueOf() && rangeEnd.valueOf() <= end.valueOf();

    return isStartBetweenRange || isEndBetweenRange || isScheduleEncompassesRange;
  });

  return schedules;
}

export async function read(id: Schedule["id"]): Promise<ScheduleWithModificationRecords> {
  const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
  const file = Bun.file(path);
  const contents = await file.json();
  return scheduleWithModificationRecordsSchema.parse(contents);
}

export async function remove(id: Schedule["id"]): Promise<void> {
  const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
  const file = Bun.file(path);
  await file.delete();
}

export async function update(schedule: Schedule): Promise<void> {
  const path = `${DATA_PATH}${schedule.id}${FILE_EXTENSION}`;
  const existingSchedule = await read(schedule.id);
  const scheduleWithModificationRecords = {
    ...schedule,
    modificationRecords: [
      existingSchedule.modificationRecords,
      {
        changeDescription: "Schedule updated",
        modificationDate: dayjs().toISOString(),
      },
    ],
  };

  await Bun.write(path, JSON.stringify(scheduleWithModificationRecords));
}

export async function write(schedule: Schedule): Promise<void> {
  const path = `${DATA_PATH}${schedule.id}${FILE_EXTENSION}`;
  const scheduleWithModificationRecords = {
    ...schedule,
    modificationRecords: [
      {
        changeDescription: "Initial creation",
        modificationDate: dayjs().toISOString(),
      }
    ],
  };
  await Bun.write(path, JSON.stringify(scheduleWithModificationRecords));
}
