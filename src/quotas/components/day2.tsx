import { Uses, Takes, watch, RouteData } from "wallace";
import { dbx } from "../data";
import type { DayData, TargetEntry, TargetData, UserTargets } from "../types";
import { wrapPage, WrappedPageHub } from "../../../lib/page-wrapper";
import styles from "../styles/targets.module.css";

type WithHub<Model> = Uses<{ hub: DayPageHub; model: Model }>;

interface EntryModel {
  target: TargetData;
  entry: TargetEntry;
}

interface PageModel {
  entries: EntryModel[];
}

class DayPageHub extends WrappedPageHub<PageModel> {
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
      this.setModel();
    });
  }
  setModel() {
    let entries: EntryModel[] = this.userTargets.targets.map((target) => ({
      target,
      entry: this.dayData.entries[target.id],
    }));
    if (this.mode === "view") {
      entries = entries.filter((entry) => entry.entry);
    }
    this.model = {
      entries: watch(entries, () => {
        console.log("changes");
        //   this.page.update();
        //   dbx.targets.put({ targets: this.targets });
      }),
    };
    // this.pageModel.entries = watch(entries, () => {
    //   console.log("changes");
    //   //   this.page.update();
    //   //   dbx.targets.put({ targets: this.targets });
    // });
  }
  setMode(mode: "edit" | "view") {
    this.mode = mode;
    this.setModel();
    this.page.update();
  }
}

const DayPageInner: WithHub<PageModel> = ({ entries }, { hub }) => (
  <div>
    <button if={hub.mode === "edit"} onClick={hub.setMode("view")}>
      View
    </button>
    <button if={hub.mode === "view"} onClick={hub.setMode("edit")}>
      Edit
    </button>
    <Entry.repeat models={entries} />
  </div>
);

const Entry: WithHub<EntryModel> = (entry, { hub }) => (
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
          <input bind:valueAsNumber={entry.scheduling.increment} />
        </div>
        <div>
          <label>max</label>
          <input bind:valueAsNumber={entry.scheduling.max} />
        </div>
      </div> */}
    </form>
  </div>
);

export const DayPage = wrapPage<PageModel>(DayPageInner, DayPageHub);
