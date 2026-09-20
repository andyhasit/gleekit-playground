import { File } from "../../lib/filedb";
import {
  ActionButtonsModel,
  EntryModel,
  DetailFormModel,
  DetailFormFields,
} from "./views";
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
  _blockUpdate: boolean = false;
  root: ComponentInstance;
  entries: EntryModel[] = [];
  mode: Mode = Mode.Normal;
  actionButtomsModel: ActionButtonsModel;
  detailFormModel: DetailFormModel;
  rootNode: EntryModel;
  _filter: string = "";
  constructor(
    public data: Data,
    public db: File<Data>
  ) {
    this.rootNode = new EntryModel(
      { name: "(root)", sub: this.data.sub },
      this
    );
    this.rootNode._children = buildActiveEntries(
      this.rootNode.entry.sub,
      this,
      this.rootNode
    );
    this.actionButtomsModel = new ActionButtonsModel(this);
    this.detailFormModel = new DetailFormModel(this);
  }
  get filter() {
    return this._filter;
  }
  set filter(value: string) {
    this._filter = value;
    this._setInclusion(this.rootNode);
    this.update();
  }
  _setInclusion(entry: EntryModel) {
    let childIncluded = false;
    for (const child of entry.children) {
      this._setInclusion(child);
      childIncluded ||= child.included;
    }
    entry.included = childIncluded || entry.name.includes(this._filter);
    return entry.included;
  }
  get rootEntries() {
    return this.rootNode.children;
  }
  get selectedEntries() {
    return this.entries.filter((entry) => entry.selected);
  }
  get selectedEntry() {
    if (this.selectedEntries.length > 1)
      throw new Error("Multiple selected entries!");
    return this.selectedEntries[0];
  }
  update(reset?: boolean) {
    if (reset) this._blockUpdate = false;
    if (!this._blockUpdate) this.root.update();
  }
  expandCollapseAll(expanded: boolean) {
    this.entries.forEach((entry) => (entry._expanded = expanded));
    this.update();
  }
  _setMode(mode: Mode) {
    this.mode = mode;
    this.update();
  }
  _cancelAction() {
    this.mode = Mode.Normal;
    this.update();
  }
  _completeAction() {
    // TODO: show progress spinner? block UI? Extra mode?
    this.db.put(this.data).then(() => {
      this.mode = Mode.Normal;
      this.clearSelected();
    });
  }
  _getAddTarget() {
    const target = this.selectedEntry;
    if (target) {
      if (!target.isFolder) throw new Error("not a folder");
      return target;
    }
    return this.rootNode;
  }
  startAddAction() {
    this._getAddTarget();
    this.detailFormModel.setTarget(null);
    this._setMode(Mode.Add);
  }
  confirmAddAction(fields: DetailFormFields) {
    const entry: Entry = { name: fields.name };
    const target = this._getAddTarget();
    if (fields.isFolder) entry.sub = [];
    const activeEntry = new EntryModel(entry, this, target);
    target._children.push(activeEntry);
    target.entry.sub.push(entry);
    this.entries.push(activeEntry);
    this._completeAction();
  }
  startMoveAction() {
    this._setMode(Mode.Move);
  }
  confirmMove(target: EntryModel) {
    if (!target.isFolder) throw new Error("not a folder");
    const dest = target.entry.sub;
    this.selectedEntries.forEach((entry) => {
      moveItem(entry.entry, entry.parent.entry.sub, dest);
      moveItem(entry, entry.parent._children, target._children);
      entry.parent = target;
    });

    target._expanded = true;
    if (process.env.NODE_ENV === "development") {
      console.log("Data before move:", JSON.stringify(this.data, null, 2));
      console.log(
        "Moved",
        this.selectedEntries.map((e) => e.entry.name).join(", "),
        "to",
        target.name
      );
    }
    this._completeAction();
  }
  startDeleteAction() {
    this._setMode(Mode.Delete);
  }
  confirmDelete() {
    this.selectedEntries.forEach((entry) => {
      this._deleteEntry(entry);
    });
    this._completeAction();
  }
  _deleteEntry(entry: EntryModel) {
    entry.children.forEach((child) => {
      this._deleteEntry(child);
    });
    removeItem(entry.entry, entry.parent.entry.sub);
    removeItem(entry, entry.parent._children);
    removeItem(entry, this.entries);
  }
  startEditAction() {
    this.detailFormModel.setTarget(this.selectedEntry);
    this._setMode(Mode.Edit);
  }
  confirmEditAction(details: DetailFormFields) {
    const entry = this.selectedEntry.entry;
    entry.name = details.name;
    if (this.selectedEntry.isFolder != details.isFolder) {
      if (details.isFolder) {
        entry.sub = [];
      } else {
        entry.sub = undefined;
      }
    }
    this._completeAction();
  }
  clearSelected() {
    this._blockUpdate = true;
    this.entries.forEach((entry) => (entry.selected = false));
    this.update(true);
  }
}

function buildActiveEntries(
  entries: Entry[],
  hub: Hub,
  parent?: EntryModel
): EntryModel[] {
  return entries.map((entry) => {
    const model = new EntryModel(entry, hub, parent);
    model._children = buildActiveEntries(entry.sub ?? [], hub, model);
    hub.entries.push(model);
    return model;
  });
}
