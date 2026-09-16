import type { Data, Entry } from "../types";
import type { WithHub } from "../hub";

/*
todo:
  display selected entries
  display action options
    move
      select location
        search/browse
    delete
      confirm
    if single item
      rename
      convert
      add?
        select location
*/
export const Edit: WithHub<Data> = (_, { hub }) => (
  <div>
    <div>Edit {hub.selectedEntries.length}</div>
    <div>
      <button onClick={foo()}>Move</button>
      <button onClick={foo()}>Delete</button>
    </div>
  </div>
);

const foo = () => console.log("foo");
