"use client";

import dayjs, { type Dayjs } from "dayjs";
import { range } from "es-toolkit";
import { useState } from "react";

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

const sampleSchedules: ScheduleWithModificationRecords[] = [
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

export default function GanttChart({
  dateOffset,
  // indexOffset,
  pivotDate,
}: Props) {
  const [schedules, setSchedules] =
    useState<ScheduleWithModificationRecords[]>(sampleSchedules);
  const [dragState, setDragState] = useState<null | {
    columnOffset: number;
    dragType: "move" | "resize-end" | "resize-start";
    initialEndDate?: string;
    initialStartDate: string;
    scheduleId: string;
    startX: number;
  }>(null);

  const moveSchedule = (id: string, count: number) => {
    setSchedules((prevSchedules) =>
      prevSchedules
        .map((schedule) =>
          schedule.id === id
            ? {
                ...schedule,
                endDate: dayjs(schedule.endDate)
                  .add(count, "day")
                  .format("YYYY-MM-DD"),
                modificationRecords: [
                  ...schedule.modificationRecords,
                  {
                    changeDescription: `Moved by ${count} days`,
                    modificationDate: dayjs().toISOString(),
                  },
                ],
                startDate: dayjs(schedule.startDate)
                  .add(count, "day")
                  .format("YYYY-MM-DD"),
              }
            : schedule,
        )
        .toSorted(
          (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
        ),
    );
  };

  const removeSchedule = (id: string) => {
    setSchedules((prevSchedules) =>
      prevSchedules.filter((schedule) => schedule.id !== id),
    );
  };

  const createSchedule = (startDate: Dayjs, endDate: Dayjs) => {
    const newSchedule: ScheduleWithModificationRecords = {
      endDate: endDate.format("YYYY-MM-DD"),
      id: crypto.randomUUID(),
      modificationRecords: [
        {
          changeDescription: "Initial creation",
          modificationDate: dayjs().toISOString(),
        },
      ],
      startDate: startDate.format("YYYY-MM-DD"),
    };
    setSchedules((prevSchedules) =>
      [...prevSchedules, newSchedule].toSorted(
        (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
      ),
    );
  };

  const updateStartDate = (id: string, startDate: Dayjs) => {
    setSchedules((prevSchedules) =>
      prevSchedules
        .map((schedule) =>
          schedule.id === id
            ? {
                ...schedule,
                startDate: startDate.format("YYYY-MM-DD"),
              }
            : schedule,
        )
        .toSorted(
          (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
        ),
    );
  };

  const updateEndDate = (id: string, endDate: Dayjs) => {
    setSchedules((prevSchedules) =>
      prevSchedules
        .map((schedule) =>
          schedule.id === id
            ? {
                ...schedule,
                endDate: endDate.format("YYYY-MM-DD"),
              }
            : schedule,
        )
        .toSorted(
          (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
        ),
    );
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    scheduleId: string,
    dragType: "move" | "resize-end" | "resize-start" = "move",
  ) => {
    e.preventDefault();
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    setDragState({
      columnOffset: 0,
      dragType,
      initialEndDate: schedule.endDate,
      initialStartDate: schedule.startDate,
      scheduleId,
      startX: e.clientX,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    const gridElement = e.currentTarget;
    const gridRect = gridElement.getBoundingClientRect();
    const columnWidth = gridRect.width / DATE_SIZE;

    const deltaX = e.clientX - dragState.startX;
    const columnsMoved = Math.round(deltaX / columnWidth);

    if (columnsMoved !== dragState.columnOffset) {
      setDragState({
        ...dragState,
        columnOffset: columnsMoved,
      });
    }
  };

  const handleMouseUp = () => {
    if (dragState && dragState.columnOffset !== 0) {
      if (dragState.dragType === "move") {
        moveSchedule(dragState.scheduleId, dragState.columnOffset);
      } else if (dragState.dragType === "resize-start") {
        const schedule = schedules.find((s) => s.id === dragState.scheduleId);
        if (schedule) {
          const newStartDate = dayjs(dragState.initialStartDate).add(
            dragState.columnOffset,
            "day",
          );
          const endDate = dayjs(schedule.endDate);
          // 시작일이 종료일 이후가 되지 않도록 제한
          if (newStartDate.isBefore(endDate) || newStartDate.isSame(endDate)) {
            updateStartDate(dragState.scheduleId, newStartDate);
          }
        }
      } else if (dragState.dragType === "resize-end") {
        const schedule = schedules.find((s) => s.id === dragState.scheduleId);
        if (schedule && dragState.initialEndDate) {
          const newEndDate = dayjs(dragState.initialEndDate).add(
            dragState.columnOffset,
            "day",
          );
          const startDate = dayjs(schedule.startDate);
          // 종료일이 시작일 이전이 되지 않도록 제한
          if (newEndDate.isAfter(startDate) || newEndDate.isSame(startDate)) {
            updateEndDate(dragState.scheduleId, newEndDate);
          }
        }
      }
    }
    setDragState(null);
  };

  const firstDateOnView = dayjs(pivotDate)
    .add(dateOffset, "day")
    .subtract(DATE_PADDING + DATE_MARGIN, "day");
  const lastDateOnView = dayjs(pivotDate)
    .add(dateOffset, "day")
    .add(DATE_PADDING + DATE_MARGIN, "day");

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
    <div
      className="grid grid-cols-[repeat(29,3rem)]"
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      {dates.map((date) => (
        <div
          className={cn(
            "flex h-10 w-full items-center justify-center border-r border-b border-gray-300 text-center text-sm",
            date.isWeekend || date.isHoliday
              ? "bg-gray-100 dark:bg-gray-800"
              : "bg-white dark:bg-black",
          )}
          key={date.key}
        >
          {date.label}
        </div>
      ))}

      {/* Grid cells for schedule rows */}
      {schedules.map((_, rowIndex) =>
        dates.map((date, colIndex) => (
          <div
            className={cn(
              "h-10 w-full border-r border-b border-dashed border-gray-200",
              date.isWeekend || date.isHoliday
                ? "bg-gray-100 dark:bg-gray-800"
                : "bg-white dark:bg-black",
            )}
            key={`${rowIndex}-${date.key}`}
            onClick={() => {
              const date = firstDateOnView.add(colIndex, "day");
              createSchedule(date, date);
            }}
            style={{
              gridColumn: colIndex + 1,
              gridRow: rowIndex + 2,
            }}
          />
        )),
      )}

      {schedules.map((schedule, index) => {
        const isDragging =
          dragState?.scheduleId === schedule.id && dragState.columnOffset !== 0;
        const isResizingStart =
          isDragging && dragState?.dragType === "resize-start";
        const isResizingEnd =
          isDragging && dragState?.dragType === "resize-end";
        const isMoving = isDragging && dragState?.dragType === "move";

        const startDate = isResizingStart
          ? dayjs(dragState.initialStartDate).add(dragState.columnOffset, "day")
          : isMoving
            ? dayjs(dragState.initialStartDate).add(
                dragState.columnOffset,
                "day",
              )
            : dayjs(schedule.startDate);
        const endDate = isResizingEnd
          ? dayjs(dragState.initialEndDate).add(dragState.columnOffset, "day")
          : isMoving
            ? dayjs(schedule.endDate).add(dragState.columnOffset, "day")
            : dayjs(schedule.endDate);

        const startColIndex = calculateGridColumnIndex(
          [firstDateOnView, lastDateOnView],
          startDate,
        );
        const endColIndex =
          calculateGridColumnIndex([firstDateOnView, lastDateOnView], endDate) +
          1;
        return (
          <div
            className="flex items-center p-1"
            key={schedule.id}
            style={{
              gridColumnEnd: endColIndex,
              gridColumnStart: startColIndex,
              gridRow: index + 2,
            }}
          >
            <div
              className={cn(
                "group flex h-full w-full cursor-move items-center justify-between select-none",
                "rounded-md bg-amber-100",
                "border border-amber-200 shadow-sm",
                "transition-shadow hover:shadow-md",
                dragState?.scheduleId === schedule.id && "opacity-70 shadow-lg",
              )}
              onMouseDown={(e) => handleMouseDown(e, schedule.id, "move")}
            >
              {/* Start resize handle */}
              <div
                className="h-full w-2 cursor-ew-resize opacity-0 transition-opacity group-hover:opacity-100"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, schedule.id, "resize-start");
                }}
              >
                <div className="h-full w-full rounded-l-md bg-amber-400" />
              </div>
              <div className="flex flex-1 justify-end">
                <button
                  className="rounded px-1 transition-colors hover:bg-amber-200"
                  onClick={() => {
                    removeSchedule(schedule.id);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  X
                </button>
              </div>

              {/* End resize handle */}
              <div
                className="h-full w-2 cursor-ew-resize opacity-0 transition-opacity group-hover:opacity-100"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, schedule.id, "resize-end");
                }}
              >
                <div className="h-full w-full rounded-r-md bg-amber-400" />
              </div>
            </div>
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
