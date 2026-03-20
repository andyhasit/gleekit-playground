import { mount, Router, Uses, route } from "wallace";
import { DayPage } from "./day";
import { TargetsPage } from "./pages/targets/targets";
import { ctrl } from "./controller";
import { getLastNDays, toWeekDay } from "./utils";
import styles from "./nav.module.css";

const routerProps = {
  routes: [
    route("", DayPage),
    route("/day/{day:date}", DayPage),
    route("/targets", TargetsPage),
  ],
};

const NavLink: Uses<{ href: string; text: string }> = ({ href, text }) => (
  <a class={styles.navlink} href={href}>
    {text}
  </a>
);

const App = () => (
  <div>
    <div css={styles.navButtons}>
      <NavLink.repeat props={links} />
    </div>
    <Router props={routerProps} ctrl={ctrl} />
  </div>
);

const links = [{ href: "#/targets", text: "Targets" }];

getLastNDays(5).forEach((date) => {
  links.unshift({
    href: "#/day/" + date.toISOString().slice(0, 10),
    text: toWeekDay(date).slice(0, 3),
  });
});

mount("app", App);
