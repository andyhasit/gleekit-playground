import { Mode } from "../hub";
import type { ActiveEntry, WithHub } from "../hub";

const iconClass = (entry: ActiveEntry) => {
  if (entry.isFolder) {
    if (entry.hasChildren) {
      return entry.expanded ? "las la-minus-circle" : "las la-plus-circle";
    }
    return "las la-circle";
  }
  return "las la-hand-point-right";
};

export const LocationRow: WithHub<ActiveEntry> = (entry, { hub }) => (
  <div class="mt-2 ml-2">
    <div class="flex justify-between">
      <div onClick={entry.toggle()}>
        <i class={iconClass(entry)}></i>
        <span class="ml-2">{entry.name}</span>
      </div>
      <input if={hub.mode === Mode.Normal} bind-as:checkbox={entry.selected} />
      <div
        if={hub.mode === Mode.Move && entry.isFolder}
        onClick={hub.confirmMove(entry)}
      >
        <i class="las la-chevron-left"></i>
      </div>
    </div>
    <div class="ml-2" if={entry.expanded}>
      <LocationRow.repeat models={entry.children} />
    </div>
  </div>
);
