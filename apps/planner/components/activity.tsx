import { extendComponent, watch } from "wallace";
import type { ComponentInstance, Uses, RouteData } from "wallace";
import { dbx } from "../data";
import type { ActivitySettings, Activity } from "../types";
import { PageWrapper } from "./page";
import styles from "../styles/targets.module.css";

class Controller {
  settings: ActivitySettings;
  activities: Activity[];
  draftTarget: Activity;
  component: ComponentInstance;
  constructor(routeData: RouteData) {}
  async load(): Promise<void> {
    // return Promise.all([
    //   dbx.targets.get().then((res) => (this.userTargets = res)),
    //   dbx.day.get(this.date).then((res) => (this.dayData = res)),
    // ]).then(() => {
    //   this.mode =
    //     Object.keys(this.dayData.entries).length > 0 ? "view" : "edit";
    //   this.setEntries();
    // });
  }
  // async load(routeData: RouteData): Promise<void> {
  //   const res = await dbx.targets.get();
  //   this.targets = res.targets;
  //   this.pageProps = {
  //     targets: watch(this.targets, () => {
  //       console.log("changes");
  //       this.page.update();
  //       dbx.targets.put({ targets: this.targets });
  //     }),
  //   };
  // }
  newDraftTarget() {
    this.draftTarget = {
      id: this.settings.activities.length + 1,
      name: "",
      defaults: {
        duration: 30,
        startTime: 0,
      },
      dataType: "normal",
    };
    this.component.update();
  }
  saveDraftTarget() {
    const draftTarget = this.draftTarget;
    this.draftTarget = undefined;
    // this.pageProps.targets.push(draftTarget);
  }
}

// cancel draft button
const ActivityPageInner: Uses<Controller> = ({ activities }, { hub }) => (
  <div>
    Activities
    {/* <Target.repeat model={activities} />
    <button if={!hub.draftTarget} onClick={hub.newDraftTarget()}>
      add
    </button>
    <div if={hub.draftTarget}>
      <Target model={hub.draftTarget} />
      <button onClick={hub.saveDraftTarget()}>Save</button>
    </div> */}
  </div>
);

const Target: Uses<Controller> = (target, { hub }) => (
  <div>Settings</div>
  // <div css={styles.target} style:borderColor={target.color}>
  //   <form>
  //     <div css={styles.targetDetails}>
  //       <input style="font-size: 18px" bind={target.title} />
  //       <input type="color" bind={target.color} />
  //     </div>
  //     <div css={styles.scheduleInputs}>
  //       <div>
  //         <label>units</label>
  //         <input bind={target.units} />
  //       </div>
  //       <div>
  //         <label>increment</label>
  //         <input bind:valueAsNumber={target.scheduling.increment} />
  //       </div>
  //       <div>
  //         <label>max</label>
  //         <input bind:valueAsNumber={target.scheduling.max} />
  //       </div>
  //     </div>
  //   </form>
  // </div>
);

const ActivitiesPage = extendComponent(PageWrapper);
ActivitiesPage.methods = {
  load(routeData: RouteData) {
    const hub = new Controller(routeData);
    return hub.load().then(() => hub);
  },
};

ActivitiesPage.stub.page = ActivityPageInner;

export { ActivitiesPage };
