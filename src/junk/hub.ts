import type { ComponentInstance, Uses } from "wallace";
import { gleekit } from "gleekit";
import { File } from "../../lib/filedb";
import type { Data, Entry, Location } from "./types";

export type WithHub<Model> = Uses<{ hub: Hub; model: Model }>;
export type HubOnly = Uses<{ hub: Hub; model: null }>;

export enum Mode {
  Normal = 1, // No action
  Add,
  Move,
  Edit,
  Delete,
}

export interface AddItemFormFields {
  name: string;
  isFolder: boolean;
  error?: string;
}

class AddItemForm {
  name: string;
  isFolder: boolean;
  error: string | null;
  constructor(public hub: Hub) {
    this.reset();
  }
  reset() {
    this.name = "";
    this.isFolder = false;
    this.error = null;
  }
  submit() {
    this.hub.confirmAddAction(this);
    this.reset();
  }
}

export class Hub {
  dialog: HTMLDialogElement;
  root: ComponentInstance;
  entries: ActiveEntry[] = [];
  mode: Mode = Mode.Normal;
  addItemForm: AddItemForm;
  constructor(
    public data: Data,
    public db: File<Data>
  ) {
    buildActiveEntries(this.data.root, this);
    this.addItemForm = new AddItemForm(this);
  }
  get rootEntries() {
    return this.entries.filter((entry) => !entry.parent);
  }
  get selectedEntries() {
    return this.entries.filter((entry) => entry.selected);
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
    // timer, block UI? Extra mode?
    this.db.put(this.data).then(() => {
      this.mode = Mode.Normal;
      this.clearSelected();
    });
  }
  startMoveAction() {
    this.setMode(Mode.Move);
  }
  confirmMove(target: ActiveEntry) {
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
  confirmAddAction(details: AddItemForm) {
    const target = this.selectedEntries[0];
    const entry: Entry = { name: details.name };
    if (details.isFolder) entry.sub = [];
    const activeEntry = new ActiveEntry(entry, this, target);
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

function moveItem(item: any, srcArray: any[], destArray: any[]) {
  srcArray.splice(srcArray.indexOf(item), 1);
  destArray.push(item);
}

function removeItem(item: any, array: any[]) {
  array.splice(array.indexOf(item), 1);
}

function buildActiveEntries(
  entries: Entry[],
  hub: Hub,
  parent: ActiveEntry | null = null
): ActiveEntry[] {
  return entries.map((entry) => {
    const activeEntry = new ActiveEntry(entry, hub, parent);
    hub.entries.push(activeEntry);
    activeEntry._children = buildActiveEntries(
      entry.sub ?? [],
      hub,
      activeEntry
    );
    return activeEntry;
  });
}

function compareProperty(property) {
  return function (a, b) {
    return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
  };
}

function compareNameNoCase(entryA, entryB) {
  const a = entryA.name.toLowerCase(),
    b = entryB.name.toLowerCase();
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortByName(items) {
  return items.sort(compareNameNoCase);
}

export class ActiveEntry {
  _expanded = false;
  _selected = false;
  _children: ActiveEntry[] = [];
  constructor(
    public entry: Entry,
    public hub: Hub,
    public parent: ActiveEntry | null = null
  ) {
    this.entry = entry;
    this.hub = hub;
    this.parent = parent;
  }
  get name() {
    return this.entry.name;
  }
  get children(): ActiveEntry[] {
    const folders = [],
      items = [];
    this._children.forEach((entry) =>
      (entry.isFolder ? folders : items).push(entry)
    );
    return [...sortByName(folders), ...sortByName(items)];
  }
  get expanded() {
    return this._expanded;
  }
  get selected() {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = value;
    this.hub.root.update();
  }
  get hasChildren() {
    return this._children.length > 0;
  }
  toggle() {
    if (this.isFolder) {
      this._expanded = !this._expanded;
      this.hub.root.update();
    }
  }
  get isFolder() {
    return this.entry.sub !== undefined;
  }
}
