import { mount } from "wallace";
import { App } from "./components/app";

mount("app", App);

window.gleekit.onLoad(() => {
  gleekit.setAppMenu([{ html: "Activities", link: "#/activities" }]);
  console.log("loaded2");
});
