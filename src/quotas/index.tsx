import { mount } from "wallace";
import { App } from "./components/app";
import { gleekit } from "gleekit";

gleekit.setAppMenu([
  {
    link: "Settings",
    html: "/settings",
  },
]);
mount("app", App);
