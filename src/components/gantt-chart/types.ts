export interface DateInfo {
  isHoliday: boolean;
  isWeekend: boolean;
  key: string;
  label: string;
}

export interface DragState {
  columnOffset: number;
  dragType: "move" | "resize-end" | "resize-start";
  initialEndDate: string;
  initialStartDate: string;
  scheduleId: string;
  startX: number;
}
