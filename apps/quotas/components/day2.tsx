import { Uses, watch, RouteData } from "wallace";
import { dbx } from "../data";
import type { DayData, TargetEntry, TargetData, UserTargets } from "../types";
import { pageLoader, PageController } from "./page";
import styles from "../styles/targets.module.css";

type WithCtrl<Props> = Uses<{ ctrl: Controller; props: Props }>;

interface EntryProps {
  target: TargetData;
  entry: TargetEntry;
}

interface PageProps {
  entries: EntryProps[];
}

class Controller extends PageController<PageProps> {
  userTargets: UserTargets;
  date: Date;
  dayData: DayData;
  mode: "edit" | "view" = "view";
  async load(routeData: RouteData): Promise<void> {
    this.date = routeData.args.day;
    return Promise.all([
      dbx.targets.get().then((res) => (this.userTargets = res)),
      dbx.day.get(this.date).then((res) => (this.dayData = res)),
    ]).then(() => {
      this.mode = this.dayData.entries ? "view" : "edit";
      this.setProps();
    });
  }
  setProps() {
    let entries: EntryProps[] = this.userTargets.targets.map((target) => ({
      target,
      entry: this.dayData.entries[target.id],
    }));
    if (this.mode === "view") {
      entries = entries.filter((entry) => entry.entry);
    }
    this.pageProps = {
      entries: watch(entries, () => {
        console.log("changes");
        //   this.page.update();
        //   dbx.targets.put({ targets: this.targets });
      }),
    };
    // this.pageProps.entries = watch(entries, () => {
    //   console.log("changes");
    //   //   this.page.update();
    //   //   dbx.targets.put({ targets: this.targets });
    // });
  }
  setMode(mode: "edit" | "view") {
    this.mode = mode;
    this.setProps();
    this.page.update();
  }
}

const DayPageInner: Uses<PageProps> = ({ entries }, { ctrl }) => (
  <div>
    <button if={ctrl.mode === "edit"} onClick={ctrl.setMode("view")}>
      View
    </button>
    <button if={ctrl.mode === "view"} onClick={ctrl.setMode("edit")}>
      Edit
    </button>
    <Entry.repeat props={entries} />
  </div>
);

const Entry: WithCtrl<EntryProps> = (entry, { ctrl }) => (
  <div css={styles.target} style:borderColor={entry.target.color}>
    <form>
      <div css={styles.targetDetails}>
        <input style="font-size: 18px" bind={entry.target.title} />
        <input type="color" bind={entry.target.color} />
      </div>
      {/* <div css={styles.scheduleInputs}>
        <div>
          <label>units</label>
          <input bind={entry.units} />
        </div>
        <div>
          <label>increment</label>
          <input bindNumber={entry.scheduling.increment} />
        </div>
        <div>
          <label>max</label>
          <input bindNumber={entry.scheduling.max} />
        </div>
      </div> */}
    </form>
  </div>
);

export const DayPage = pageLoader<PageProps>(DayPageInner, Controller);
