"use client";

import dayjs, { type Dayjs } from "dayjs";
import { range } from "es-toolkit";

import { cn } from "@/lib/utils";
import { ScheduleWithModificationRecords } from "@/server/schema/schedules";

interface Props {
  dateOffset: number;
  // indexOffset: number;
  pivotDate: Dayjs;
}

/*
 * Display 1 (pivot)
 * + before 7days (padding)
 * + after 7days (padding)
 * + 7 early days for buffer (margin)
 * + 7 late days for buffer (margin)
 */
const DATE_PADDING = 7;
const DATE_MARGIN = 7;
const DATE_SIZE = 1 + DATE_PADDING * 2 + DATE_MARGIN * 2;
/*
 * Display 10 lines of items
 * + 5 upper buffer
 * + 5 lower buffer
 */
// const ITEM_BUFFER = 5;
// const ITEM_SIZE = 10 + ITEM_BUFFER * 2;

export default function GanttChart({
  dateOffset,
  // indexOffset,
  pivotDate,
}: Props) {
  const schedules: ScheduleWithModificationRecords[] = [
    {
      endDate: "2025-12-16",
      id: "24d65ae6-e3af-4b1e-a86a-ebea7102e2b7",
      modificationRecords: [
        {
          changeDescription: "Initial creation",
          modificationDate: "2025-12-14T10:28:52.369Z",
        },
      ],
      startDate: "2025-12-11",
    },
    {
      endDate: "2025-12-15",
      id: "b3aa62b4-359a-4f30-ac2e-abf95437a233",
      modificationRecords: [
        {
          changeDescription: "Initial creation",
          modificationDate: "2025-12-14T10:28:41.801Z",
        },
      ],
      startDate: "2025-12-12",
    },
    {
      endDate: "2025-12-18",
      id: "ed04a636-1f44-4927-b8f6-732aa0338750",
      modificationRecords: [
        {
          changeDescription: "Initial creation",
          modificationDate: "2025-12-14T10:28:27.065Z",
        },
      ],
      startDate: "2025-12-14",
    },
  ];

  const firstDateOnView = dayjs(pivotDate)
    .add(dateOffset, "day")
    .subtract(DATE_PADDING + DATE_MARGIN, "day");
  const lastDateOnView = dayjs(pivotDate)
    .add(dateOffset, "day")
    .add(DATE_PADDING + DATE_MARGIN, "day");
  console.log("firstDateOnView", firstDateOnView.format("YYYY-MM-DD"));
  console.log("lastDateOnView", lastDateOnView.format("YYYY-MM-DD"));

  const dates = range(DATE_SIZE).map((_, index) => {
    const date = firstDateOnView.add(index, "day");
    return {
      isHoliday: false, // TODO: 휴일 여부 로직 추가
      isWeekend: date.day() === 0 || date.day() === 6,
      key: date.format("YYYY-MM-DD"),
      label: date.format("DD"),
    };
  });

  return (
    <div className="grid grid-cols-[repeat(29,3rem)]">
      {/* Header */}
      {dates.map((date) => (
        <div
          className={cn(
            "h-10 w-full border border-gray-200 text-center text-sm",
            date.isWeekend || date.isHoliday
              ? "bg-red-100 dark:bg-red-900"
              : "bg-white dark:bg-black",
          )}
          key={date.key}
        >
          {date.label}
        </div>
      ))}

      {schedules.map((schedule) => {
        const startColIndex = calculateGridColumnIndex(
          [firstDateOnView, lastDateOnView],
          dayjs(schedule.startDate),
        );
        const endColIndex =
          calculateGridColumnIndex(
            [firstDateOnView, lastDateOnView],
            dayjs(schedule.endDate),
          ) + 1;
        return (
          <div
            className="h-10 bg-amber-100"
            key={schedule.id}
            style={{
              gridColumnEnd: endColIndex,
              gridColumnStart: startColIndex,
            }}
          >
            {/* <Schedule schedule={schedule} /> */}
          </div>
        );
      })}
    </div>
  );
}

function calculateGridColumnIndex(range: [Dayjs, Dayjs], date: Dayjs) {
  if (date.valueOf() < range[0].valueOf()) {
    return 1;
  }
  if (date.valueOf() > range[1].valueOf()) {
    return range[1].diff(range[0], "day") + 2;
  }
  return date.diff(range[0], "day") + 1;
}
