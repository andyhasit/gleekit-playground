import { Router, mount, route } from "wallace";
import { db } from "./db";
import { Hub } from "./hub";
import { Home } from "./views/home";

db.get().then((data) => {
  /*
  The progress spinner is visible until we mount to "app"
  Each route should have its own spinner, but for now we only have one.
  */
  const hub = new Hub(data, db);
  mount("app", Router, {
    routes: [route("", Home, () => hub)],
  });
});
