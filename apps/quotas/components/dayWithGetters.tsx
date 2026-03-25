import { Uses, protect, watch, RouteData, ComponentInstance } from "wallace";
import { dbx } from "../data";
import type {
  DayData,
  LogEntry,
  TargetEntry,
  TargetData,
  TargetScheduling,
  UserTargets,
} from "../types";
import { pageLoader, PageController } from "./page";
import styles from "../styles/targets.module.css";
import { Watcher } from "./watcher";
import { withGetters } from "./getters";

type WithCtrl<Props> = Uses<{ ctrl: Controller; props: Props }>;

interface EntryProps {
  target: TargetData;
  entry: TargetEntry;
  scheduling: TargetScheduling;
  quota: number;
  log: LogEntry[];
  total: number;
  showLog: boolean;
  component?: ComponentInstance<EntryProps>;
}

interface PageProps {
  entries: EntryProps[];
}

const unWatch = (object: any) => JSON.parse(JSON.stringify(object));

const toEntry = (target: TargetData, entry: TargetEntry): EntryProps => {
  return withGetters(
    {
      target,
      entry,
      scheduling: target.scheduling,
      log: entry?.log || [],
      quota: entry?.quota || 0,
      showLog: false,
    },
    {
      total: (foo) =>
        (foo.entry?.log || []).reduce((acc, log) => acc + log.count, 0),
    }
  );
};

class Controller extends PageController<PageProps> {
  userTargets: UserTargets;
  date: Date;
  dayData: DayData;
  mode: "edit" | "view" = "view";
  watcher: Watcher<EntryProps>;
  async load(routeData: RouteData): Promise<void> {
    this.date = routeData.args.day || new Date();
    this.watcher = new Watcher(
      [["quota", "log"], (target) => this.targetChanged(target)],
      [["showLog"], (target) => target.component.update()],
      [["component"], () => null]
    );
    return Promise.all([
      dbx.targets.get().then((res) => (this.userTargets = res)),
      dbx.day.get(this.date).then((res) => (this.dayData = res)),
    ]).then(() => {
      this.mode =
        Object.keys(this.dayData.entries).length > 0 ? "view" : "edit";

      this.pageProps = { entries: [] };
      this.setProps();
    });
  }
  setProps() {
    let entries: EntryProps[] = this.userTargets.targets.map((target) =>
      toEntry(target, this.dayData.entries[target.id])
    );
    if (this.mode === "view") {
      entries = entries.filter((entry) => entry.entry);
    }
    this.pageProps.entries = this.watcher.map(entries);
  }
  setMode(mode: "edit" | "view") {
    this.mode = mode;
    this.setProps();
    this.page.update();
  }
  targetChanged(entry: EntryProps) {
    // Need to extract the dayEntry if new, but
    // Be careful not to pass the reactive objects back in.
    this.dayData.entries[entry.target.id] = {
      log: unWatch(entry.log),
      quota: entry.quota,
    };
    dbx.day.put(this.date, this.dayData);
    // this.setProps();
    this.page.update();
  }
}

const DayPageInner: WithCtrl<PageProps> = ({ entries }, { ctrl }) => (
  <div>
    <button if={ctrl.mode === "edit"} onClick={ctrl.setMode("view")}>
      View
    </button>
    <button if={ctrl.mode === "view"} onClick={ctrl.setMode("edit")}>
      Edit
    </button>
    <Entry.repeat props={entries} />
    <div if={ctrl.mode === "view" && !entries.length}>
      No targets for today. Use edit mode.
    </div>
  </div>
);

const Entry: WithCtrl<EntryProps> = (entry, { ctrl }) => (
  <div
    assign={entry.component}
    css={styles.target}
    style:borderColor={entry.target.color}
  >
    <div style="font-size: 14px;">{entry.target.title}</div>
    <div if={ctrl.mode === "view"}>
      <progress
        max={entry.scheduling.max}
        style:accentColor={entry.target.color}
        style="width: 100%"
        value={entry.total}
      ></progress>
      {entry.total}
    </div>
    <div if={ctrl.mode === "edit"}>
      <form>
        <input
          disabled={ctrl.mode === "view"}
          type="range"
          min="0"
          style="width: 100%"
          style:accentColor={entry.target.color}
          step={entry.scheduling.increment}
          max={entry.scheduling.max}
          bind={entry.quota}
        />
        {entry.quota}
      </form>
    </div>

    <button
      if={ctrl.mode === "view"}
      onClick={entry.log.push({
        time: 2,
        count: entry.target.scheduling.increment,
      })}
    >
      ++
    </button>
    <button onClick={(entry.showLog = !entry.showLog)}>...</button>
    <div if={entry.showLog}>
      <div>Log</div>
      <Log.repeat props={entry.log} />
    </div>
  </div>
);

const Log: WithCtrl<LogEntry> = (log, { ctrl }) => (
  <div>
    <div>{log.time}</div>
    <div>{log.count}</div>
  </div>
);
export const DayPage = pageLoader<PageProps>(DayPageInner, Controller);

/*

TODO:
  add mode
  
*/

class Foo {
  bar: string;
  // protected baz: string;
  constructor() {}
  get baz() {
    return "baz";
  }
  set baz(value: string) {
    throw new Error("Attempted to modify protected object");
  }
}

window.foo = new Foo();
