import { Uses, watch, RouteData, ComponentInstance } from "wallace";
import { dbx } from "../data";
import type { TargetId, iEntry } from "../types";

class Controller {
  date: Date;
  entries: {
    [key: TargetId]: number;
  };
  root: ComponentInstance;
  constructor(root: ComponentInstance, date: Date) {
    this.root = root;
    this.date = date;
  }
  init() {
    dbx.day.get(this.date).then((res) => {
      this.entries = res.entries;
      console.log(this.entries);
    });
  }
  go() {
    this.entries[1] = 4;
    dbx.day.put(this.date, { entries: this.entries });
  }
}

const Entry: Uses<iEntry> = () => <div>Entry</div>;

const EntryTable: Uses<Date> = () => (
  <div>
    <Entry.repeat model={[]} />
  </div>
);

export const DayPage: Uses<RouteData> = ({ args }, { hub }) => (
  <div>
    Entries here
    <EntryTable model={args.date} />
    <button onClick={hub.go()}>Go</button>
  </div>
);

DayPage.methods = {
  render(model) {
    this.hub = new Controller(this, model.args.date || new Date());
    this.hub.init();
  },
};

/*

const Target: WithCtrl<TargetData> = (target, { hub }) => (
  <div css={styles.target} style:borderColor={target.color}>
    <form>

    <div>{target.title}</div>
    <div>{target.units}</div>
    <div>{target.scheduling.increment}</div>
    <div>{target.scheduling.max}</div>
    </form>
  </div>
);
*/
