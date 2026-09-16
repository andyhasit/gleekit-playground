import type { ComponentInstance, Uses } from "wallace";
import { gleekit } from "gleekit";
import type { Data, Entry, Location } from "./types";

export type WithHub<Model> = Uses<{ hub: Hub; model: Model }>;

export enum Mode {
  Normal = 1,
  Add,
  Move,
  Edit,
  Delete,
}

export class Hub {
  dialog: HTMLDialogElement;
  root: ComponentInstance;
  data: Data;
  entries: ActiveEntry[] = [];
  mode: Mode = Mode.Normal;
  constructor(data: Data) {
    this.data = data;
    buildActiveEntries(this.data.root, this);
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
  startMoveAction() {
    this.setMode(Mode.Move);
  }
  confirmMove(target: ActiveEntry) {
    if (!target.isFolder) throw new Error("not a folder");
    const dest = target.entry.sub;
    this.selectedEntries.forEach((entry) => {
      moveItem(entry.entry, entry.parent.entry.sub, dest);
      moveItem(entry, entry.parent.children, target.children);
      entry.parent = target;
    });
    this.mode = Mode.Normal;
    this.clearSelected();
  }
  startDeleteAction() {
    alert("action");
  }
  startAddAction() {
    alert("action");
  }
  startEditAction() {
    alert("action");
  }
  clearSelected() {
    this.entries.forEach((entry) => entry.deselect());
    this.root.update();
  }
  deleteSelected() {}
}

function moveItem(item: any, srcArray: any[], destArray: any[]) {
  srcArray.splice(srcArray.indexOf(item), 1);
  destArray.push(item);
}

function buildActiveEntries(
  entries: Entry[],
  hub: Hub,
  parent: ActiveEntry | null = null
): ActiveEntry[] {
  return entries.map((entry) => {
    const activeEntry = new ActiveEntry(entry, hub, parent);
    hub.entries.push(activeEntry);
    activeEntry.children = buildActiveEntries(
      entry.sub ?? [],
      hub,
      activeEntry
    );
    return activeEntry;
  });
}

export class ActiveEntry {
  entry: Entry;
  hub: Hub;
  #expanded = false;
  #selected = false;
  parent: ActiveEntry | null = null;
  children: ActiveEntry[] = [];
  constructor(entry: Entry, hub: Hub, parent: ActiveEntry | null) {
    this.entry = entry;
    this.hub = hub;
    this.parent = parent;
  }
  get name() {
    return this.entry.name;
  }
  get expanded() {
    return this.#expanded;
  }
  get selected() {
    return this.#selected;
  }
  set selected(value: boolean) {
    this.#selected = value;
    this.hub.root.update();
  }
  get hasChildren() {
    return this.children.length > 0;
  }
  /**
   * Just so we can clear selection without updating.
   * Maybe not the best way?
   */
  deselect() {
    this.#selected = false;
  }
  toggle() {
    if (this.isFolder) {
      this.#expanded = !this.#expanded;
      this.hub.root.update();
    }
  }
  get isFolder() {
    return this.entry.sub !== undefined;
  }
}
