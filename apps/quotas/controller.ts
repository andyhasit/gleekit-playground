import { ComponentInstance } from "wallace";
import type { TargetData } from "./types";
import { dbx } from "./data";

export class AppController {
  constructor() {}
  getTargets(): Promise<TargetData[]> {
    return dbx.targets.get().then((res) => res.targets);
  }
}

export const ctrl = new AppController();
