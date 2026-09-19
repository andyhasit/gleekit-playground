import { Mode } from "../hub";
import type { Takes } from "wallace";
import type { Hub } from "../hub";

interface ActionButton {
  text: string;
  icon: string;
  enabled: boolean;
  click: () => void;
}

const ActionButton: Takes<ActionButton> = ({ text, icon, click, enabled }) => (
  <button
    disabled={!enabled}
    onClick={click()}
    class="border-none bg-transparent flex flex-col"
  >
    <i class={"text-2xl las la-" + icon}></i>
    <span class="text-xs">{text}</span>
  </button>
);

export class ActionButtonsModel {
  constructor(public hub: Hub) {}
  getButtons() {
    const selected = this.hub.selectedEntries.length;
    if (this.hub.mode === Mode.Normal) {
      return [
        {
          text: "Delete",
          icon: "trash-alt",
          enabled: selected >= 1,
          click: () => this.hub.startDeleteAction(),
        },
        {
          text: "Move",
          icon: "arrows-alt",
          enabled: selected >= 1,
          click: () => this.hub.startMoveAction(),
        },
        {
          text: "Edit",
          icon: "edit",
          enabled: selected === 1,
          click: () => this.hub.startEditAction(),
        },
        {
          text: "Add",
          icon: "plus-circle",
          enabled: selected === 1 && this.hub.selectedEntries[0].isFolder,
          click: () => this.hub.startAddAction(),
        },
        {
          text: "Clear",
          icon: "times-circle",
          enabled: selected >= 1,
          click: () => this.hub.clearSelected(),
        },
      ];
    }
    return [
      {
        text: "Cancel",
        icon: "times-circle",
        enabled: selected >= 1,
        click: () => this.hub.cancelAction(),
      },
    ];
  }
}

export const ActionButtonsView: Takes<ActionButtonsModel> = ({
  hub,
  getButtons,
}) => (
  <div class="border-b pb-1 h-12 flex justify-between">
    <div class="w-4/12 pt-2">{hub.selectedEntries.length} selected</div>
    <div class="w-8/12 flex justify-end gap-2">
      <ActionButton.repeat models={getButtons()} />
    </div>
  </div>
);
