import { Uses, watch } from "wallace";
import { dbx } from "../data";
import type { TargetData } from "../types";
import { pageLoader, PageController } from "../loader";
import styles from "../styles/targets.module.css";
class Controller extends PageController<unknown> {
  targets: TargetData[];
  async load(): Promise<undefined> {
    const res = await dbx.targets.get();
    this.targets = res.targets;
  }
}

type WithCtrl<Props> = Uses<{ ctrl: Controller; props: Props }>;

const Target: WithCtrl<TargetData> = (target, { ctrl }) => (
  <div css={styles.target}>
    <div>{target.title}</div>
  </div>
);

const TargetPageInner = (_, { ctrl }) => (
  <div>
    <Target.repeat props={ctrl.targets} />
  </div>
);

export const TargetsPage = pageLoader(TargetPageInner, Controller);
