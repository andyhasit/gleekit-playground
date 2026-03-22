export type TargetId = number;
export type DayOfMonth = number;

export interface iEntry {
  title: string;
  done: boolean;
  id: number;
}

export interface DayData {
  entries: {
    [key: TargetId]: number;
  };
}

export type UserTargets = { targets: TargetData[] };

export interface TargetData {
  id: TargetId;
  title: string;
  units: string;
  color: string;
  scheduling: {
    increment: number;
    max: number;
  };
}
