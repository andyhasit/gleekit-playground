import { Router, mount, route } from "wallace";
import { db } from "./db";
import { Hub } from "./hub";
import { Home } from "./pages/home";
import { Edit } from "./pages/edit";

db.get().then((data) => {
  mount(
    "app",
    Router,
    {
      routes: [route("", Home), route("edit", Edit)],
    },
    new Hub(data)
  );
});
