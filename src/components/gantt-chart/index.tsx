"use client";

import dayjs, { type Dayjs } from "dayjs";
import { range } from "es-toolkit";
import { useEffect, useRef, useState } from "react";

import { ScheduleWithModificationRecords } from "@/server/schema/schedules";

import { GanttGrid } from "./gantt-grid";
import { GanttHeader } from "./gantt-header";
import { ScheduleItem } from "./schedule-item";
import { type DragState } from "./types";

interface Props {
  dateOffset: number;
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

export default function GanttChart({ dateOffset, pivotDate }: Props) {
  const [schedules, setSchedules] =
    useState<ScheduleWithModificationRecords[]>(sampleSchedules);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [highlightedScheduleId, setHighlightedScheduleId] = useState<
    null | string
  >(null);
  const scheduleRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (highlightedScheduleId) {
      const element = scheduleRefs.current.get(highlightedScheduleId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      const timer = setTimeout(() => {
        setHighlightedScheduleId(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [highlightedScheduleId]);

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
    setHighlightedScheduleId(newSchedule.id);
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
        setHighlightedScheduleId(dragState.scheduleId);
      } else if (dragState.dragType === "resize-start") {
        const schedule = schedules.find((s) => s.id === dragState.scheduleId);
        if (schedule) {
          const newStartDate = dayjs(dragState.initialStartDate).add(
            dragState.columnOffset,
            "day",
          );
          const endDate = dayjs(schedule.endDate);
          if (newStartDate.isBefore(endDate) || newStartDate.isSame(endDate)) {
            updateStartDate(dragState.scheduleId, newStartDate);
            setHighlightedScheduleId(dragState.scheduleId);
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
          if (newEndDate.isAfter(startDate) || newEndDate.isSame(startDate)) {
            updateEndDate(dragState.scheduleId, newEndDate);
            setHighlightedScheduleId(dragState.scheduleId);
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
      isHoliday: false,
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
      <GanttHeader dates={dates} />

      <GanttGrid
        dates={dates}
        firstDateOnView={firstDateOnView}
        onCellClick={(date) => createSchedule(date, date)}
        scheduleCount={schedules.length}
      />

      {schedules.map((schedule, index) => (
        <ScheduleItem
          dragState={dragState}
          firstDateOnView={firstDateOnView}
          highlightedScheduleId={highlightedScheduleId}
          index={index}
          key={schedule.id}
          lastDateOnView={lastDateOnView}
          onMouseDown={handleMouseDown}
          onRemove={removeSchedule}
          schedule={schedule}
          scheduleRef={(el) => {
            if (el) {
              scheduleRefs.current.set(schedule.id, el);
            } else {
              scheduleRefs.current.delete(schedule.id);
            }
          }}
        />
      ))}
    </div>
  );
}
