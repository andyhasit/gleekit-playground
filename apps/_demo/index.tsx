import { mount, Uses, watch } from "wallace";
import { getJsonDbx, putJsonDbx, gleekit } from "gleekit";

interface iTask {
  title: string;
  done: boolean;
  id: number;
}

const Task: Uses<iTask> = ({ title, done, id }) => (
  <div>
    <span>{title}</span>
    <input type="checkbox" bind:checked={done} />
  </div>
);
let duration = 0;

const TaskList: Uses<iTask[]> = (tasks) => (
  <div>
    <h3>Tasks with update</h3>
    <div>Duration: {duration}</div>
    <Task.repeat props={tasks} />
  </div>
);

let data;
const start = performance.now();
let r = 9;
window.addEventListener("load", function () {
  const root = mount("app", TaskList, []);
  getJsonDbx("/tasks.json").then((res) => {
    duration = performance.now() - start;
    data = res;
    const tasks = watch(data.tasks, () => {
      putJsonDbx("/tasks.json", data);
      root.update();
    });
    root.render(tasks);
  });
  gleekit.setAppMenu([{ link: "#", html: "Home" }]);
});
