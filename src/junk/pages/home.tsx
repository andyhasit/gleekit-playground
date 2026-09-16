import type { Data, Entry } from "../types";
import { Mode } from "../hub";
import type { ActiveEntry, Hub, WithHub } from "../hub";

export const Home: WithHub<Data> = (_, { hub }) => (
  <div class="m-2" assign={hub.root}>
    {/* <dialog ref:dialog>This is an open dialog window</dialog> */}
    <div class="border-b pb-1 h-12 flex justify-between">
      <div class="w-4/12 pt-2">{hub.selectedEntries.length} selected</div>
      <div class="w-8/12 flex justify-end gap-2">
        <ActionButton.repeat models={actionButtons(hub)} />
      </div>
    </div>
    <div if={hub.mode === Mode.Normal || hub.mode === Mode.Move}>
      <LocationRow.repeat models={hub.rootEntries} />
    </div>
  </div>
);

interface ActionButton {
  text: string;
  icon: string;
  enabled: boolean;
  click: () => void;
}

const ActionButton: WithHub<ActionButton> = ({
  text,
  icon,
  click,
  enabled,
}) => (
  <button
    disabled={!enabled}
    onClick={click()}
    class="border-none bg-transparent flex flex-col"
  >
    <i class={"text-2xl las la-" + icon}></i>
    <span class="text-xs">{text}</span>
  </button>
);

function actionButtons(hub: Hub) {
  const selected = hub.selectedEntries.length;
  if (hub.mode === Mode.Normal) {
    return [
      {
        text: "Delete",
        icon: "trash-alt",
        enabled: selected >= 1,
        click: () => hub.deleteSelected(),
      },
      {
        text: "Move",
        icon: "arrows-alt",
        enabled: selected >= 1,
        click: () => hub.startMoveAction(),
      },
      {
        text: "Edit",
        icon: "edit",
        enabled: selected === 1,
        click: () => hub.startEditAction(),
      },
      {
        text: "Add",
        icon: "plus-circle",
        enabled: selected === 1 && hub.selectedEntries[0].isFolder,
        click: () => hub.startAddAction(),
      },
      {
        text: "Clear",
        icon: "times-circle",
        enabled: selected >= 1,
        click: () => hub.clearSelected(),
      },
    ];
  }
  return [
    {
      text: "Cancel",
      icon: "times-circle",
      enabled: selected >= 1,
      click: () => hub.cancelAction(),
    },
  ];
}

// TODO: get rid once wallace's assign is fixed.
Home.methods.render = function (model, hub) {
  this.model = model;
  this.hub = hub;
  hub.root = this;
  this.update();
};

const iconClass = (entry: ActiveEntry) =>
  entry.isFolder
    ? entry.expanded
      ? "las la-minus-circle"
      : entry.hasChildren
        ? "las la-plus-circle"
        : "las la-circle"
    : "las la-hand-point-right";

const LocationRow: WithHub<ActiveEntry> = (entry, { hub }) => (
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
