import {
  Uses,
  extendComponent,
  protect,
  watch,
  RouteData,
  ComponentInstance,
} from "wallace";
import { dbx } from "../data";
import type {
  DayData,
  LogEntry,
  TargetEntry,
  TargetData,
  TargetScheduling,
  UserTargets,
} from "../types";
import { pageLoader, PageController, PageWrapper } from "./page";
import styles from "../styles/targets.module.css";
import { Watcher } from "./watcher";
import { withGetters } from "./getters";

// type WithCtrl<Props> = Uses<{ ctrl: Controller; props: Props }>;

// interface EntryProps {
//   target: TargetData;
//   entry: TargetEntry;
//   scheduling: TargetScheduling;
//   quota: number;
//   log: LogEntry[];
//   total: number;
//   showLog: boolean;
//   component?: ComponentInstance<EntryProps>;
// }

// interface PageProps {
//   entries: EntryProps[];
// }

const unWatch = (object: any) => JSON.parse(JSON.stringify(object));

// const toEntry = (target: TargetData, entry: TargetEntry): EntryProps => {
//   return withGetters(
//     {
//       target,
//       entry,
//       scheduling: target.scheduling,
//       log: entry?.log || [],
//       quota: entry?.quota || 0,
//       showLog: false,
//     },
//     {
//       total: (foo) =>
//         (foo.entry?.log || []).reduce((acc, log) => acc + log.count, 0),
//     }
//   );
// };

// class Controller extends PageController<PageProps> {
//   userTargets: UserTargets;
//   date: Date;
//   dayData: DayData;
//   mode: "edit" | "view" = "view";
//   watcher: Watcher<EntryProps>;
//   async load(routeData: RouteData): Promise<void> {
//     this.date = routeData.args.day || new Date();
//     this.watcher = new Watcher(
//       [["quota", "log"], (target) => this.targetChanged(target)],
//       [["showLog"], (target) => target.component.update()],
//       [["component"], () => null]
//     );
//     return Promise.all([
//       dbx.targets.get().then((res) => (this.userTargets = res)),
//       dbx.day.get(this.date).then((res) => (this.dayData = res)),
//     ]).then(() => {
//       this.mode =
//         Object.keys(this.dayData.entries).length > 0 ? "view" : "edit";

//       this.pageProps = { entries: [] };
//       this.setProps();
//     });
//   }
//   setProps() {
//     let entries: EntryProps[] = this.userTargets.targets.map((target) =>
//       toEntry(target, this.dayData.entries[target.id])
//     );
//     if (this.mode === "view") {
//       entries = entries.filter((entry) => entry.entry);
//     }
//     this.pageProps.entries = this.watcher.map(entries);
//   }
//   setMode(mode: "edit" | "view") {
//     this.mode = mode;
//     this.setProps();
//     this.page.update();
//   }
//   targetChanged(entry: EntryProps) {
//     // Need to extract the dayEntry if new, but
//     // Be careful not to pass the reactive objects back in.
//     this.dayData.entries[entry.target.id] = {
//       log: unWatch(entry.log),
//       quota: entry.quota,
//     };
//     dbx.day.put(this.date, this.dayData);
//     // this.setProps();
//     this.page.update();
//   }
// }
class AltController {
  userTargets: UserTargets;
  date: Date;
  dayData: DayData;
  mode: "edit" | "view" = "view";
  watcher: Watcher<EntryCtrl>;
  entries: EntryCtrl[];
  component: ComponentInstance;
  constructor(routeData: RouteData) {
    this.date = routeData.args.day || new Date();
  }
  async load(): Promise<void> {
    // this.watcher = new Watcher(
    //   [["quota", "log"], (target) => this.targetChanged(target)],
    //   [["showLog"], (target) => target.component.update()],
    //   [["component"], () => null]
    // );
    return Promise.all([
      dbx.targets.get().then((res) => (this.userTargets = res)),
      dbx.day.get(this.date).then((res) => (this.dayData = res)),
    ]).then(() => {
      this.mode =
        Object.keys(this.dayData.entries).length > 0 ? "view" : "edit";
      this.setEntries();
    });
  }
  setEntries() {
    let entries: EntryCtrl[] = this.userTargets.targets.map(
      (target) =>
        new EntryCtrl(
          target,
          this.dayData.entries[target.id] || { quota: 0, log: [] },
          this
        )
    );
    if (this.mode === "view") {
      entries = entries.filter((entry) => entry.entry);
    }
    this.entries = entries; //this.watcher.map(entries);
  }
  setMode(mode: "edit" | "view") {
    this.mode = mode;
    this.setEntries();
    this.component.update();
  }
  targetChanged(targetId: number, entry: TargetEntry) {
    // Need to extract the dayEntry if new, but
    // Be careful not to pass the reactive objects back in.
    this.dayData.entries[targetId] = entry;
    dbx.day.put(this.date, this.dayData);
    this.component.update();
  }
}

class EntryCtrl {
  target: TargetData;
  entry: TargetEntry;
  component?: ComponentInstance;
  ctrl: AltController;
  mode: "view" | "edit";
  state: { showLog: boolean };
  constructor(target: TargetData, entry: TargetEntry, ctrl: AltController) {
    this.target = target;
    this.ctrl = ctrl;
    this.mode = ctrl.mode;
    this.entry = watch(entry, () => this.ctrl.targetChanged(target.id, entry));
    this.state = watch({ showLog: false }, () => this.component.update());
  }
  get total() {
    return (this.entry?.log || []).reduce((acc, log) => acc + log.count, 0);
  }
}

const Entry: Uses<EntryCtrl> = ({
  component,
  entry,
  target,
  state,
  mode,
  total,
}) => (
  <div assign={component} css={styles.target} style:borderColor={target.color}>
    <div style="font-size: 14px;">{target.title}</div>
    <div if={mode === "view"}>
      <progress
        max={target.scheduling.max}
        style:accentColor={target.color}
        style="width: 100%"
        value={total}
      ></progress>
      {total}
    </div>
    <div if={mode === "edit"}>
      <form>
        <input
          disabled={mode === "view"}
          type="range"
          min="0"
          style="width: 100%"
          style:accentColor={target.color}
          step={target.scheduling.increment}
          max={target.scheduling.max}
          bind={entry.quota}
        />
        {entry.quota}
      </form>
    </div>

    <button
      if={mode === "view"}
      onClick={entry.log.push({
        time: 2,
        count: target.scheduling.increment,
      })}
    >
      ++
    </button>
    <button onClick={(state.showLog = !state.showLog)}>...</button>
    <div if={state.showLog}>
      <div>Log</div>
      <Log.repeat props={entry.log} />
    </div>
  </div>
);

const Log: Uses<LogEntry> = (log) => (
  <div>
    <div>{log.time}</div>
    <div>{log.count}</div>
  </div>
);

const DayPageInner: Uses<AltController> = ({
  component,
  entries,
  mode,
  setMode,
}) => (
  <div assign={component}>
    <button if={mode === "edit"} onClick={setMode("view")}>
      View
    </button>
    <button if={mode === "view"} onClick={setMode("edit")}>
      Edit
    </button>
    <Entry.repeat props={entries} />
    <div if={mode === "view" && !entries.length}>
      No targets for today. Use edit mode.
    </div>
  </div>
);

export const DayPage = extendComponent(PageWrapper);
DayPage.methods = {
  load(routeData: RouteData) {
    const ctrl = new AltController(routeData);
    return ctrl.load().then(() => ctrl);
  },
};

DayPage.stub.page = DayPageInner;
