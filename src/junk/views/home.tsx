import { DetailFormView } from "./DetailForm";
import { ActionButtonsView } from "./ActionButtons";
import { EntryRow } from "./Entry";
import { Mode, Hub } from "../hub";
import type { Takes } from "wallace";

export const Home: Takes<Hub> = (hub) => (
  <div class="m-2" assign={hub.root}>
    <ActionButtonsView model={hub.actionButtomsModel} />
    <div if={hub.mode === Mode.Normal || hub.mode === Mode.Move}>
      <EntryRow.repeat models={hub.rootEntries} />
    </div>
    <div if={hub.mode === Mode.Add}>
      <DetailFormView model={hub.detailFormModel} />
    </div>
    <div if={hub.mode === Mode.Delete}>
      <button onClick={hub.confirmDelete()}>
        Delete {hub.selectedEntries.length} items?
      </button>
    </div>
  </div>
);
