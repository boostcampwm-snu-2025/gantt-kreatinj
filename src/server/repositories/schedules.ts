import dayjs from "dayjs";
import fs from "node:fs/promises";

import type {
  DateRange,
  Schedule,
  ScheduleBody,
  ScheduleWithModificationRecords,
} from "@/server/schema/schedules";

import { scheduleWithModificationRecordsSchema } from "@/server/schema/schedules";

const DATA_PATH = "./src/server/data/";
const FILE_EXTENSION = ".json";

// export async function exists(id: Schedule["id"]): Promise<boolean> {
//   const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
//   return fs.access(path).then(() => true).catch(() => false);
// }

export async function create(
  schedule: ScheduleBody,
): Promise<ScheduleWithModificationRecords> {
  const id = crypto.randomUUID();
  const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
  const scheduleWithModificationRecords = {
    ...schedule,
    id,
    modificationRecords: [
      {
        changeDescription: "Initial creation",
        modificationDate: dayjs().toISOString(),
      },
    ],
  };
  await fs.mkdir(DATA_PATH, { recursive: true });
  await fs.writeFile(path, JSON.stringify(scheduleWithModificationRecords), {
    encoding: "utf-8",
  });
  return scheduleWithModificationRecords;
}

export async function list(
  range: DateRange,
): Promise<ScheduleWithModificationRecords[]> {
  const rangeStart = dayjs(range[0]);
  const rangeEnd = dayjs(range[1]);

  const files = await fs.readdir(DATA_PATH);
  const allSchedules = await Promise.all(
    files.map(async (file) => {
      const id = file.replace(FILE_EXTENSION, "");
      const schedule = await read(id);
      return schedule;
    }),
  );

  const schedules = allSchedules.filter((schedule) => {
    const start = dayjs(schedule.startDate);
    const end = dayjs(schedule.endDate);

    const isStartBetweenRange =
      rangeStart.valueOf() <= start.valueOf() &&
      start.valueOf() < rangeEnd.valueOf();
    const isEndBetweenRange =
      rangeStart.valueOf() < end.valueOf() &&
      end.valueOf() < rangeEnd.valueOf();
    const isScheduleEncompassesRange =
      start.valueOf() < rangeStart.valueOf() &&
      rangeEnd.valueOf() <= end.valueOf();

    return (
      isStartBetweenRange || isEndBetweenRange || isScheduleEncompassesRange
    );
  });

  return schedules;
}

export async function read(
  id: Schedule["id"],
): Promise<ScheduleWithModificationRecords> {
  const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
  const contents = await fs.readFile(path, { encoding: "utf-8" });
  return scheduleWithModificationRecordsSchema.parse(contents);
}

export async function remove(id: Schedule["id"]): Promise<void> {
  const path = `${DATA_PATH}${id}${FILE_EXTENSION}`;
  await fs.rm(path);
}

export async function update(
  schedule: Schedule,
): Promise<ScheduleWithModificationRecords> {
  const path = `${DATA_PATH}${schedule.id}${FILE_EXTENSION}`;
  const existingSchedule = await read(schedule.id);
  const scheduleWithModificationRecords = {
    ...schedule,
    modificationRecords: [
      ...existingSchedule.modificationRecords,
      {
        changeDescription: "Schedule updated",
        modificationDate: dayjs().toISOString(),
      },
    ],
  };

  await fs.writeFile(path, JSON.stringify(scheduleWithModificationRecords), {
    encoding: "utf-8",
  });
  return scheduleWithModificationRecords;
}
