import type { Uses, RouteData } from "wallace";
import { WrappedPageHub } from "../../../lib/page-wrapper";

export interface Model {
  name: string;
}

export class Hub extends WrappedPageHub<Model> {
  async load(routeData: RouteData): Promise<void> {
    await new Promise((r) => setTimeout(r, 2000));
    this.model = { name: "James" };
  }
}

export type WithHub<Model> = Uses<{ hub: Hub; model: Model }>;
