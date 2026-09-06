import { getDb } from "./filedb";
import type { DayData, ActivitySettings } from "./types";
import { toISODate } from "./utils";

const db = getDb({ dbName: "foo" });
export const dbx = {
  day: db.fileSet<Date, DayData>({
    path: (key) => `${toISODate(key)}.json`,
    default: (key) => ({ entries: [] }),
  }),
  settings: db.file<ActivitySettings>({
    path: "settings.json",
    default: () => ({ activities: [] }),
  }),
};
