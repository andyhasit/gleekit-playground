import { Mode } from "../hub";
import type { Hub, WithHub } from "../hub";

export const ActionButtonRow: WithHub<null> = (_, { hub }) => (
  <div class="border-b pb-1 h-12 flex justify-between">
    <div class="w-4/12 pt-2">{hub.selectedEntries.length} selected</div>
    <div class="w-8/12 flex justify-end gap-2">
      <ActionButton.repeat models={actionButtons(hub)} />
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
        click: () => hub.startDeleteAction(),
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
