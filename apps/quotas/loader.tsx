import { ComponentInstance, ComponentFunction, Uses, RouteData } from "wallace";

export function renderInitPage(CtrlClass) {
  return function (props, parentCtrl) {
    new CtrlClass(this, props, parentCtrl).init();
  };
}

/**
 * Base class for Page Controllers that need to load async.
 * The Page can use the value of ctrl to determine whether to render.
 */
export class PageController<Props> {
  page: ComponentInstance;
  constructor(page: ComponentInstance, props: Props) {
    this.page = page;
    this.page.props = props;
  }
  init() {
    const page = this.page;
    page.ctrl = null;
    page.update();
    console.log("loading");
    this.load().then(() => {
      console.log("loaded");
      page.ctrl = this;
      page.update();
    });
  }
  load(): Promise<undefined> {
    throw new Error("Not implemented");
  }
}

/**
 * Returns a component definition which wraps a page with a loader.
 *
 * @param PageComponent
 * @param Controller
 * @returns
 */
export function pageLoader(
  PageComponent: ComponentFunction<any>,
  Controller: typeof PageController<any>
) {
  const Page: Uses<RouteData> = (_, { ctrl }) => (
    <div>
      <div if={!ctrl}>wait...</div>
      <div if={ctrl}>
        <PageComponent ctrl={ctrl} />
      </div>
    </div>
  );
  Page.methods = {
    render: renderInitPage(Controller),
  };
  return Page;
}
