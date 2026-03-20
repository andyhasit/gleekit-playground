import { Uses, watch, RouteData, ComponentInstance } from "wallace";
import { dbx } from "./data";
import type { TargetId, iEntry } from "./types";

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
    <Entry.repeat props={[]} />
  </div>
);

export const DayPage: Uses<RouteData> = ({ args }, { ctrl }) => (
  <div>
    Entries here
    <EntryTable props={args.date} />
    <button onClick={ctrl.go()}>Go</button>
  </div>
);

DayPage.methods = {
  render(props) {
    this.ctrl = new Controller(this, props.args.date || new Date());
    this.ctrl.init();
  },
};
