export type TargetId = number;
export type DayOfMonth = number;

export interface LogEntry {
  time: number;
  count: number;
  // extra data
}

export interface TargetEntry {
  quota: number;
  log: LogEntry[];
}

export interface DayData {
  entries: {
    [key: TargetId]: TargetEntry;
  };
}

export type UserTargets = { targets: TargetData[] };
export type TargetScheduling = {
  increment: number;
  max: number;
};

export interface TargetData {
  id: TargetId;
  title: string;
  units: string;
  color: string;
  scheduling: TargetScheduling;
}
