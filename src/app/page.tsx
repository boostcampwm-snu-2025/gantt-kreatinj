import dayjs from "dayjs";

import GanttChart from "@/components/gantt-chart";

const today = dayjs().startOf("day");

export default async function Home() {
  return (
    <div className="h-screen w-screen">
      <GanttChart dateOffset={0} pivotDate={today} />
    </div>
  );
}
