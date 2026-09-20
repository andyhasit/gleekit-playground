import { Mode } from "../hub";
import { sortByName } from "../utils";

import type { Takes } from "wallace";
import type { Hub } from "../hub";
import type { Entry } from "../types";

export const EntryRow: Takes<EntryModel> = (entry) => (
  <div class="mt-2 ml-2">
    <div class="flex justify-between">
      <div onClick={entry.toggle()}>
        <i class={entry.iconClass()}></i>
        <span class="ml-2">{entry.name}</span>
      </div>
      <input
        if={entry.hub.mode === Mode.Normal}
        bind-as:checkbox={entry.selected}
      />
      <div
        if={entry.hub.mode === Mode.Move && entry.canMoveSelectedHere()}
        onClick={entry.hub.confirmMove(entry)}
      >
        <i class="las la-chevron-left"></i>
      </div>
    </div>
    <div class="ml-2" if={entry.expanded}>
      <EntryRow.repeat models={entry.children} />
    </div>
  </div>
);

export class EntryModel {
  included = true;
  _expanded = false;
  _selected = false;
  _children: EntryModel[] = [];
  constructor(
    public entry: Entry,
    public hub: Hub,
    public parent: EntryModel | null = null
  ) {
    this.entry = entry;
    this.hub = hub;
    this.parent = parent;
  }
  get name() {
    return this.entry.name;
  }
  get children(): EntryModel[] {
    const folders = [],
      items = [],
      filter = this.hub.filter;
    this._children.forEach((entry) => {
      // if (filter && !entry.name.includes(filter)) return;
      if (filter && !entry.included) return;
      (entry.isFolder ? folders : items).push(entry);
    });
    return [...sortByName(folders), ...sortByName(items)];
  }
  get expanded() {
    return this.hub.filter || this._expanded;
  }
  get selected() {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = value;
    this.hub.update();
  }
  get hasChildren() {
    return this._children.length > 0;
  }
  toggle() {
    if (this.isFolder) {
      this._expanded = !this._expanded;
      this.hub.update();
    }
  }
  get isFolder() {
    return this.entry.sub !== undefined;
  }
  iconClass() {
    if (this.isFolder) {
      if (this.hasChildren) {
        return this.expanded ? "las la-minus-circle" : "las la-plus-circle";
      }
      return "las la-circle";
    }
    return "las la-hand-point-right";
  }
  isParentOf(other: EntryModel) {
    while (other) {
      if (other === this) {
        return true;
      } else {
        other = other.parent;
      }
    }
    return false;
  }
  canMoveSelectedHere() {
    return (
      this.isFolder &&
      this.hub.selectedEntries.every((entry) => !entry.isParentOf(this))
    );
  }
}
