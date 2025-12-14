import z from "zod";

export const modificationRecordSchema = z.object({
  changeDescription: z.string(),
  modificationDate: z.iso.datetime(),
});

export type ModificationRecord = z.infer<typeof modificationRecordSchema>;

export const scheduleBodySchema = z.object({
  endDate: z.iso.date(),
  startDate: z.iso.date(),
});

export type ScheduleBody = z.infer<typeof scheduleBodySchema>;

export const scheduleSchema = scheduleBodySchema.extend({
  id: z.string(),
});

export type Schedule = z.infer<typeof scheduleSchema>;

export const scheduleWithModificationRecordsSchema = scheduleSchema.extend({
  modificationRecords: z.array(modificationRecordSchema),
});

export type ScheduleWithModificationRecords = z.infer<
  typeof scheduleWithModificationRecordsSchema
>;

export const dateRangeSchema = z.tuple([z.iso.date(), z.iso.date()]);

export type DateRange = z.infer<typeof dateRangeSchema>;
