/*
Exports a controller base class and component definition factory function which
work together to abstract a page that displays a progress bar while the page fetches
the data it needs.


*/
import { ComponentInstance, ComponentFunction, Uses, RouteData } from "wallace";

export function renderInitPage(CtrlClass) {
  return function (props, parentCtrl) {
    new CtrlClass(this, props, parentCtrl).init();
  };
}

/**
 * Base class for Page Controllers.
 */
export class PageController<Props> {
  isLoading: boolean = true;
  wrapper: ComponentInstance<RouteData>;
  page: ComponentInstance<Props>;
  pageProps: Props;
  constructor(
    wrapper: ComponentInstance<RouteData>,
    page: ComponentInstance<Props>,
    parentCtrl: any
  ) {
    this.wrapper = wrapper;
    this.page = page;
    this.wrapper.ctrl = this.page.ctrl = this;
  }
  init(routeData: RouteData) {
    this.wrapper.update();
    this.load(routeData).then(() => {
      this.isLoading = false;
      this.wrapper.update();
    });
  }
  load(routeData: RouteData): Promise<void> {
    throw new Error("Not implemented");
  }
}

/**
 * Returns a component definition which nests the PageComponent alongside
 * a progress bar, starting with only the progress bar visible.
 * When the controller's load function resolves, the visibility is switched
 * to show the PageComponent.
 *
 * The PageComponent receives the controller, which may also set the page's props
 * before resolving.
 *
 * @param PageComponent
 * @param Controller
 * @returns
 */
export function pageLoader<Props>(
  PageComponent: ComponentFunction<Props>,
  Controller: typeof PageController<Props>
) {
  const Wrapper: Uses<RouteData> = (_, { ctrl }) => (
    <div class="pageLoader">
      <div if={ctrl.isLoading}>wait...</div>
      <PageComponent
        if={!ctrl.isLoading}
        ref:page
        ctrl={ctrl}
        props={ctrl.pageProps}
      />
    </div>
  );
  Wrapper.methods = {
    render(props, parentCtrl) {
      //@ts-ignore
      const page = this.ref.page.get();
      this.ctrl = new Controller(this, page, parentCtrl);
      this.ctrl.init(props);
    },
  };
  return Wrapper;
}
