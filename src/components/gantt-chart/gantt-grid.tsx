import { type Dayjs } from "dayjs";

import { cn } from "@/lib/utils";

import { type DateInfo } from "./types";

interface GanttGridProps {
  dates: DateInfo[];
  firstDateOnView: Dayjs;
  onCellClick: (date: Dayjs) => void;
  scheduleCount: number;
}

export function GanttGrid({
  dates,
  firstDateOnView,
  onCellClick,
  scheduleCount,
}: GanttGridProps) {
  return (
    <>
      {Array.from({ length: scheduleCount }).map((_, rowIndex) =>
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
              const clickedDate = firstDateOnView.add(colIndex, "day");
              onCellClick(clickedDate);
            }}
            style={{
              gridColumn: colIndex + 1,
              gridRow: rowIndex + 2,
            }}
          />
        )),
      )}
    </>
  );
}
