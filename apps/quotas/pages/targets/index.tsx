import { Uses, watch, RouteData, ComponentInstance } from "wallace";
import { dbx } from "../../data";
import type { TargetId } from "../../types";

const Target: Uses<TargetId> = () => <div>Target</div>;

export const TargetsPage: Uses<Number> = (_, { ctrl }) => (
  <div>
    <Target.repeat props={[]} />
  </div>
);

TargetsPage.methods = {
  render(props, ctrl) {
    console.log(ctrl);
    this.base.render.call(this, props, ctrl);
  },
};
