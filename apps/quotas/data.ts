import { getDb } from "../../lib/filedb";
import type { DayData, UserTargets } from "./types";
import { toISODate } from "../../lib/utils";

const db = getDb({ dbName: "foo" });
export const dbx = {
  day: db.fileSet<Date, DayData>({
    path: (key) => `${toISODate(key)}.json`,
    default: () => ({ entries: {} }),
  }),
  targets: db.file<UserTargets>({
    path: "targets.json",
    default: () => ({ targets: [] }),
  }),
  // month: db.fileSet<MonthInfo, MonthData>({
  //   path: (key) => `${key.year}/${key.month}.json`,
  //   default: () => ({}),
  // }),
  // day: {
  //   get: async (date: Date) => {
  //     const month = await dbx.month.get(toMonth(date));
  //     return month[date.getDate()];
  //   },
  //   put: async (date: Date, data: DayData) => {
  //     const monthInfo = toMonth(date);
  //     const month = await dbx.month.get(monthInfo);
  //     month[date.getDate()] = data;
  //     // If we cache, this would be the same object in memory
  //     // inform dev?
  //     dbx.month.put(monthInfo, month);
  //   },
  // },
};
