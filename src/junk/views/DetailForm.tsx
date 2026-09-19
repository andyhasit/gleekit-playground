import type { Takes, ComponentInstance } from "wallace";
import type { Hub } from "../hub";

export const DetailFormView: Takes<DetailFormModel> = (form, { event }) => (
  <form class="p-4 max-w-64" assign:view>
    <div class="flex justify-between">
      <label>Name</label>
      <input type="text" ref:name bind={form.name} />
    </div>
    <div class="my-2 flex justify-between">
      <label>Folder</label>
      <input bind-as:checkbox={form.isFolder} />
    </div>
    <button type="submit" onClick={form.submit(event)}>
      Add
    </button>
    <div if={form.error} class="text-red-500">
      {form.error}
    </div>
  </form>
);

export interface DetailFormFields {
  name: string;
  isFolder: boolean;
  error?: string;
}

export class DetailFormModel {
  name: string;
  isFolder: boolean;
  error: string | null;
  view: ComponentInstance;
  constructor(public hub: Hub) {
    this.reset();
  }
  reset() {
    this.name = "";
    this.isFolder = false;
    this.error = null;
  }
  submit(event: Event) {
    event.preventDefault();
    if (this.name.trim().length === 0) {
      this.error = "Name may not be blank";
      this.view.update();
    } else {
      // change to this.fields
      this.hub.confirmAddAction(this);
      this.reset();
    }
  }
}
