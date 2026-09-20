import type { Takes, ComponentInstance } from "wallace";
import type { Hub } from "../hub";
import type { EntryModel } from "./Entry";

export const DetailFormView: Takes<DetailFormModel> = (form, { event }) => (
  <form class="p-4 max-w-64" assign:view>
    <div class="flex justify-between">
      <label>Name</label>
      <input type="text" ref:name bind={form.fields.name} />
    </div>
    <div class="my-2 flex justify-between">
      <label>Folder</label>
      <input bind-as:checkbox={form.fields.isFolder} />
    </div>
    <button type="submit" onClick={form.submit(event)}>
      Confirm
    </button>
    <div if={form.error} class="text-red-500">
      {form.error}
    </div>
  </form>
);

export interface DetailFormFields {
  name: string;
  isFolder: boolean;
}

export class DetailFormModel {
  fields: DetailFormFields = {
    name: "",
    isFolder: false,
  };
  error?: string;
  view: ComponentInstance;
  target: EntryModel;
  constructor(public hub: Hub) {}
  setTarget(target?: EntryModel) {
    this.error = null;
    this.target = target;
    if (target) {
      this.fields.name = target.entry.name;
      this.fields.isFolder = target.isFolder;
    } else {
      this.fields.name = "";
      this.fields.isFolder = false;
    }
  }
  submit(event: Event) {
    event.preventDefault();
    const error = this.validate();
    if (error) {
      this.error = error;
      this.view.update();
    } else {
      const action = this.target
        ? this.hub.confirmEditAction
        : this.hub.confirmAddAction;
      action.bind(this.hub)(this.fields);
    }
  }
  validate(): string | undefined {
    if (this.fields.name.trim().length === 0) {
      return "Name may not be blank";
    } else {
      if (this.target) {
        if (
          this.target.isFolder &&
          !this.fields.isFolder &&
          this.target.children.length > 0
        ) {
          return "Folder must be empty if converting to file";
        }
      }
    }
  }
}
