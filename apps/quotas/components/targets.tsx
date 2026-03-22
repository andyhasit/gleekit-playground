import { Uses, watch, RouteData } from "wallace";
import { dbx } from "../data";
import type { TargetData } from "../types";
import { pageLoader, PageController } from "./page";
import styles from "../styles/targets.module.css";

type WithCtrl<Props> = Uses<{ ctrl: Controller; props: Props }>;
interface PageProps {
  targets: TargetData[];
}

class Controller extends PageController<PageProps> {
  targets: TargetData[];
  draftTarget: TargetData;
  async load(routeData: RouteData): Promise<void> {
    const res = await dbx.targets.get();
    this.targets = res.targets;
    this.pageProps = {
      targets: watch(this.targets, () => {
        console.log("changes");
        this.page.update();
        dbx.targets.put({ targets: this.targets });
      }),
    };
  }
  newDraftTarget() {
    this.draftTarget = {
      id: this.targets.length + 1,
      title: "",
      units: "",
      color: "",
      scheduling: {
        increment: 1,
        max: 1,
      },
    };
    this.page.update();
  }
  saveDraftTarget() {
    const draftTarget = this.draftTarget;
    this.draftTarget = undefined;
    this.pageProps.targets.push(draftTarget);
  }
}

// cancel draft button
const TargetPageInner: Uses<PageProps> = ({ targets }, { ctrl }) => (
  <div>
    <Target.repeat props={targets} />
    <button if={!ctrl.draftTarget} onClick={ctrl.newDraftTarget()}>
      add
    </button>
    <div if={ctrl.draftTarget}>
      <Target props={ctrl.draftTarget} />
      <button onClick={ctrl.saveDraftTarget()}>Save</button>
    </div>
  </div>
);

// add delete button, allow moving

const Target: WithCtrl<TargetData> = (target, { ctrl }) => (
  <div css={styles.target} style:borderColor={target.color}>
    <form>
      <div css={styles.targetDetails}>
        <input style="font-size: 18px" bind={target.title} />
        <input type="color" bind={target.color} />
      </div>
      <div css={styles.scheduleInputs}>
        <div>
          <label>units</label>
          <input bind={target.units} />
        </div>
        <div>
          <label>increment</label>
          <input bindNumber={target.scheduling.increment} />
        </div>
        <div>
          <label>max</label>
          <input bindNumber={target.scheduling.max} />
        </div>
      </div>
    </form>
  </div>
);

export const TargetsPage = pageLoader<PageProps>(TargetPageInner, Controller);
