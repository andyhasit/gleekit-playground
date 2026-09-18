import type { ComponentInstance } from "wallace";
import type { ActiveEntry, Hub, HubOnly } from "../hub";

export const AddItemForm: HubOnly = (_, { hub, self, event }) => (
  <form class="p-4 max-w-64">
    <div class="flex justify-between">
      <label>Name</label>
      <input type="text" ref:name bind={hub.addItemForm.name} />
    </div>
    <div class="my-2 flex justify-between">
      <label>Folder</label>
      <input bind-as:checkbox={hub.addItemForm.isFolder} />
    </div>
    <button type="submit" onClick={submit(event, hub, self)}>
      Add
    </button>
    <div if={hub.addItemForm.error} class="text-red-500">
      {hub.addItemForm.error}
    </div>
  </form>
);

function submit(event: Event, hub: Hub, form: ComponentInstance) {
  event.preventDefault();
  if (hub.addItemForm.name.trim().length === 0) {
    hub.addItemForm.error = "Name may not be blank";
    form.update();
  } else {
    hub.addItemForm.submit();
  }
}
