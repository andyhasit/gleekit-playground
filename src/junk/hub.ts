import { File } from "../../lib/filedb";
import { ActionButtonsModel, EntryModel, DetailFormModel } from "./views";
import { moveItem, removeItem } from "./utils";

import type { ComponentInstance } from "wallace";
import type { Data, Entry } from "./types";

export enum Mode {
  Normal = 1, // No action
  Add,
  Move,
  Edit,
  Delete,
}

export class Hub {
  root: ComponentInstance;
  entries: EntryModel[] = [];
  mode: Mode = Mode.Normal;
  actionButtomsModel: ActionButtonsModel;
  detailFormModel: DetailFormModel;
  constructor(
    public data: Data,
    public db: File<Data>
  ) {
    buildActiveEntries(this.data.root, this);
    this.actionButtomsModel = new ActionButtonsModel(this);
    this.detailFormModel = new DetailFormModel(this);
  }
  get rootEntries() {
    return this.entries.filter((entry) => !entry.parent);
  }
  get selectedEntries() {
    return this.entries.filter((entry) => entry.selected);
  }
  update() {
    this.root.update();
  }
  setMode(mode: Mode) {
    this.mode = mode;
    this.root.update();
  }
  cancelAction() {
    this.mode = Mode.Normal;
    this.root.update();
  }
  completeAction() {
    // TODO: show progress spinner? block UI? Extra mode?
    this.db.put(this.data).then(() => {
      this.mode = Mode.Normal;
      this.clearSelected();
    });
  }
  startMoveAction() {
    this.setMode(Mode.Move);
  }
  confirmMove(target: EntryModel) {
    if (!target.isFolder) throw new Error("not a folder");
    const dest = target.entry.sub;
    this.selectedEntries.forEach((entry) => {
      // should be method
      moveItem(entry.entry, entry.parent.entry.sub, dest);
      moveItem(entry, entry.parent._children, target._children);
      entry.parent = target;
    });
    target._expanded = true;
    this.completeAction();
  }
  startDeleteAction() {
    this.setMode(Mode.Delete);
  }
  confirmDelete() {
    this.selectedEntries.forEach((entry) => {
      removeItem(entry.entry, entry.parent.entry.sub);
      removeItem(entry, entry.parent._children);
      removeItem(entry, this.entries);
      // TODO: delete children from entries too
    });
    this.completeAction();
  }
  startAddAction() {
    const target = this.selectedEntries[0];
    if (!target) throw new Error("no target selected");
    if (!target.isFolder) throw new Error("not a folder");
    this.setMode(Mode.Add);
  }
  confirmAddAction(details: DetailFormModel) {
    const target = this.selectedEntries[0];
    const entry: Entry = { name: details.name };
    if (details.isFolder) entry.sub = [];
    const activeEntry = new EntryModel(entry, this, target);
    target._children.push(activeEntry);
    target.entry.sub.push(entry);
    this.completeAction();
  }
  startEditAction() {
    alert("action");
  }
  clearSelected() {
    this.entries.forEach((entry) => (entry._selected = false));
    this.root.update();
  }
  deleteSelected() {}
}

function buildActiveEntries(
  entries: Entry[],
  hub: Hub,
  parent: EntryModel | null = null
): EntryModel[] {
  return entries.map((entry) => {
    const activeEntry = new EntryModel(entry, hub, parent);
    hub.entries.push(activeEntry);
    activeEntry._children = buildActiveEntries(
      entry.sub ?? [],
      hub,
      activeEntry
    );
    return activeEntry;
  });
}
