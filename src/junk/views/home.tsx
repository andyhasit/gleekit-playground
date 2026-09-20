import { DetailFormView } from "./DetailForm";
import { ActionButtonsView } from "./ActionButtons";
import { EntryRow } from "./Entry";
import { Mode, Hub } from "../hub";
import type { Takes } from "wallace";

export const Home: Takes<Hub> = (hub) => (
  <div class="m-2" assign={hub.root}>
    <ActionButtonsView model={hub.actionButtomsModel} />
    <div if={hub.mode === Mode.Move}>
      <button onClick={hub.confirmMove(hub.rootNode)}>Top</button>
    </div>
    <div if={hub.mode === Mode.Normal || hub.mode === Mode.Move}>
      <div class="py-2 flex items-center">
        <div class="w-1/2 pl-2 flex items-center justify-between">
          <div>Selected: {hub.selectedEntries.length}</div>
          <div>
            <button class="plain" onClick={hub.expandCollapseAll(true)}>
              <i class="las text-xl la-expand-arrows-alt"></i>
            </button>
            <button class="plain" onClick={hub.expandCollapseAll(false)}>
              <i class="las text-xl la-compress-arrows-alt"></i>
            </button>
          </div>
        </div>
        <div class="w-1/2 flex min-w-0">
          <input class="flex-1 min-w-0" bind={hub.filter} event:keyup />
          <button
            disabled={hub.filter === ""}
            class="shrink-0 ml-1 plain"
            onClick={(hub.filter = "")}
          >
            <i class="las text-xl la-times-circle"></i>
          </button>
        </div>
      </div>
      <EntryRow.repeat models={hub.rootEntries} />
    </div>
    <div if={hub.mode === Mode.Add || hub.mode === Mode.Edit}>
      <DetailFormView model={hub.detailFormModel} />
    </div>
    <div if={hub.mode === Mode.Delete}>
      <button class="mt-2" onClick={hub.confirmDelete()}>
        Delete {hub.selectedEntries.length} items?
      </button>
    </div>
  </div>
);
