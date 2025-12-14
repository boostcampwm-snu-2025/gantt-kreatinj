import { type Dayjs } from "dayjs";

export function calculateGridColumnIndex(
  range: [Dayjs, Dayjs],
  date: Dayjs,
): number {
  if (date.valueOf() < range[0].valueOf()) {
    return 1;
  }
  if (date.valueOf() > range[1].valueOf()) {
    return range[1].diff(range[0], "day") + 2;
  }
  return date.diff(range[0], "day") + 1;
}
