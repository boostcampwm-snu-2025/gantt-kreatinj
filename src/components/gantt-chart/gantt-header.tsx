import { cn } from "@/lib/utils";

import { type DateInfo } from "./types";

interface GanttHeaderProps {
  dates: DateInfo[];
}

export function GanttHeader({ dates }: GanttHeaderProps) {
  return (
    <>
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
    </>
  );
}
