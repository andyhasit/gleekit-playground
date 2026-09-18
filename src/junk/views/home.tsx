import { Mode } from "../hub";
import type { HubOnly } from "../hub";
import { AddItemForm } from "./add-item-form";
import { ActionButtonRow } from "./action-buttons";
import { LocationRow } from "./location-row";

export const Home: HubOnly = (_, { hub }) => (
  <div class="m-2" assign={hub.root}>
    <ActionButtonRow model={null} />
    <div if={hub.mode === Mode.Normal || hub.mode === Mode.Move}>
      <LocationRow.repeat models={hub.rootEntries} />
    </div>
    <div if={hub.mode === Mode.Add}>
      <AddItemForm model={null} />
    </div>
    <div if={hub.mode === Mode.Delete}>
      <button onClick={hub.confirmDelete()}>
        Delete {hub.selectedEntries.length} items?
      </button>
    </div>
  </div>
);

// TODO: get rid once wallace's assign is fixed.
Home.methods.render = function (model, hub) {
  this.model = model;
  this.hub = hub;
  hub.root = this;
  this.update();
};
