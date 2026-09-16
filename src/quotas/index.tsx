import { mount } from "wallace";
import { App } from "./components/app";
import { gleekit } from "gleekit";

gleekit.setAppMenu([
  {
    link: "/settings",
    html: "SS",
  },
]);
mount("app", App);
