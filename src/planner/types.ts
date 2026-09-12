export type DayOfMonth = number;
export type ActivityId = number;
export type ActivityDataType = "normal" | "workout" | "meal";

// The number of minutes since midnight
export type StartTime = number;

export interface DayEntry {
  activityId: ActivityId;
  startTime: StartTime;
  duration: number;
}

export interface DayData {
  entries: DayEntry[];
}

export type ActivitySettings = { activities: Activity[] };

export interface Activity {
  id: ActivityId;
  name: string;
  defaults: {
    duration: number;
    startTime: StartTime;
  };
  dataType: ActivityDataType;
}
