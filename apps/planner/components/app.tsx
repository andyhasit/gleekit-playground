import { Router, Uses, route } from "wallace";
import { DayPage } from "./day";
import { ActivitiesPage } from "./activity";
import { getLastNDays, toWeekDay, navTo } from "../utils";
import styles from "../styles/app.module.css";

const routerProps = {
  routes: [
    route("", DayPage),
    route("/day/{day:date}", DayPage, null, (component) =>
      component.dismount()
    ),
    route("/activities", ActivitiesPage),
  ],
};

const NavLink: Uses<{ href: string; text: string }> = ({ href, text }) => (
  <button class={styles.navlink} onClick={navTo(href)}>
    {text}
  </button>
);

export const App = () => (
  <div>
    <div css={styles.navButtons}>
      <NavLink.repeat models={links} />
    </div>
    <Router model={routerProps} />
  </div>
);

const links = [{ href: "#/activities", text: "Activities" }];

getLastNDays(5).forEach((date) => {
  links.unshift({
    href: "#/day/" + date.toISOString().slice(0, 10),
    text: toWeekDay(date).slice(0, 3),
  });
});
