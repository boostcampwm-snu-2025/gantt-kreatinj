import z from "zod";

export const modificationRecordSchema = z.object({
  changeDescription: z.string(),
  modificationDate: z.iso.datetime(),
});

export type ModificationRecord = z.infer<typeof modificationRecordSchema>;

export const scheduleSchema = z.object({
  endDate: z.iso.date(),
  id: z.string(),
  modificationRecords: z.array(modificationRecordSchema),
  startDate: z.iso.date(),
});

export type Schedule = z.infer<typeof scheduleSchema>;

export const dateRangeSchema = z.tuple([z.iso.date(), z.iso.date()]);

export type DateRange = z.infer<typeof dateRangeSchema>;
