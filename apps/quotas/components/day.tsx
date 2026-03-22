import { Uses, watch, RouteData } from "wallace";
import { dbx } from "../data";
import type { DayData, TargetData } from "../types";
import { pageLoader, PageController } from "./page";
import styles from "../styles/targets.module.css";

type WithCtrl<Props> = Uses<{ ctrl: Controller; props: Props }>;
interface PageProps {
  targets: TargetData[];
}

class Controller extends PageController<PageProps> {
  targets: TargetData[];
  date: Date;
  dayData: DayData;
  mode: "edit" | "view" = "view";
  async load(routeData: RouteData): Promise<void> {
    this.date = routeData.args.day;
    return Promise.all([
      dbx.targets.get().then((res) => (this.targets = res.targets)),
      dbx.day.get(this.date).then((res) => (this.dayData = res)),
    ]).then(() => {
      this.pageProps = {
        targets: watch(this.targets, () => {
          console.log("changes");
          //   this.page.update();
          //   dbx.targets.put({ targets: this.targets });
        }),
      };
    });
  }
  setMode(mode: "edit" | "view") {
    this.mode = mode;
  }
}

// alternatively show all lists and filter
const DayPageInner: Uses<PageProps> = ({ targets }, { ctrl }) => (
  <div>
    <div if={ctrl.mode === "view"}>
      <Target.repeat props={targets} />
    </div>
    <div if={ctrl.mode === "edit"}>
      <Target.repeat props={targets} />
    </div>
  </div>
);

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

export const DayPage = pageLoader<PageProps>(DayPageInner, Controller);
