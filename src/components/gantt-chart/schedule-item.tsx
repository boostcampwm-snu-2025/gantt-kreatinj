import dayjs, { type Dayjs } from "dayjs";

import { cn } from "@/lib/utils";
import { ScheduleWithModificationRecords } from "@/server/schema/schedules";

import { ResizeHandle } from "./resize-handle";
import { type DragState } from "./types";
import { calculateGridColumnIndex } from "./utils";

interface ScheduleItemProps {
  dragState: DragState | null;
  firstDateOnView: Dayjs;
  highlightedScheduleId: null | string;
  index: number;
  lastDateOnView: Dayjs;
  onMouseDown: (
    e: React.MouseEvent,
    scheduleId: string,
    dragType?: "move" | "resize-end" | "resize-start",
  ) => void;
  onRemove: (id: string) => void;
  schedule: ScheduleWithModificationRecords;
  scheduleRef: (el: HTMLDivElement | null) => void;
}

export function ScheduleItem({
  dragState,
  firstDateOnView,
  highlightedScheduleId,
  index,
  lastDateOnView,
  onMouseDown,
  onRemove,
  schedule,
  scheduleRef,
}: ScheduleItemProps) {
  const isDragging =
    dragState?.scheduleId === schedule.id && dragState.columnOffset !== 0;
  const isResizingStart = isDragging && dragState?.dragType === "resize-start";
  const isResizingEnd = isDragging && dragState?.dragType === "resize-end";
  const isMoving = isDragging && dragState?.dragType === "move";

  const startDate = isResizingStart
    ? dayjs(dragState.initialStartDate).add(dragState.columnOffset, "day")
    : isMoving
      ? dayjs(dragState.initialStartDate).add(dragState.columnOffset, "day")
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
    calculateGridColumnIndex([firstDateOnView, lastDateOnView], endDate) + 1;

  return (
    <div
      className="flex items-center p-1"
      key={schedule.id}
      ref={scheduleRef}
      style={{
        gridColumnEnd: endColIndex,
        gridColumnStart: startColIndex,
        gridRow: index + 2,
      }}
    >
      <div
        className={cn(
          "group flex h-full w-full cursor-move items-center justify-between select-none",
          "rounded-md",
          "border border-amber-200 shadow-sm",
          "transition-all hover:shadow-md",
          dragState?.scheduleId === schedule.id && "opacity-70 shadow-lg",
          highlightedScheduleId === schedule.id
            ? "bg-amber-300 animate-[pulse_0.6s_ease-in-out_2]"
            : "bg-amber-100",
        )}
        onMouseDown={(e) => onMouseDown(e, schedule.id, "move")}
      >
        <ResizeHandle
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, schedule.id, "resize-start");
          }}
          position="left"
        />

        <div className="flex flex-1 justify-end">
          <button
            className="rounded px-1 transition-colors hover:bg-amber-200"
            onClick={() => {
              onRemove(schedule.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            X
          </button>
        </div>

        <ResizeHandle
          onMouseDown={(e) => {
            e.stopPropagation();
            onMouseDown(e, schedule.id, "resize-end");
          }}
          position="right"
        />
      </div>
    </div>
  );
}
