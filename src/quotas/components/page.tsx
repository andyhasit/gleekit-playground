/*
Exports a controller (now hub) base class and component definition factory function which
work together to abstract a page that displays a progress bar while the page fetches
the data it needs.


*/
import { ComponentInstance, ComponentFunction, Uses, RouteData } from "wallace";

export function renderInitPage(CtrlClass) {
  return function (model, parentCtrl) {
    new CtrlClass(this, model, parentCtrl).init();
  };
}

/**
 * Base class for Page Controllers.
 */
export class PageController<Model> {
  isLoading: boolean = true;
  wrapper: ComponentInstance<RouteData>;
  page: ComponentInstance<Model>;
  pageProps: Model;
  constructor(
    wrapper: ComponentInstance<RouteData>,
    page: ComponentInstance<Model>,
    parentCtrl: any
  ) {
    this.wrapper = wrapper;
    this.page = page;
    this.wrapper.hub = this.page.hub = this;
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
 * The PageComponent receives the controller, which may also set the page's model
 * before resolving.
 *
 * @param PageComponent
 * @param Controller
 * @returns
 */
export function pageLoader<Model>(
  PageComponent: ComponentFunction<Model>,
  Controller: typeof PageController<Model>
) {
  const Wrapper: Uses<RouteData> = (_, { hub }) => (
    <div class="pageLoader">
      <div if={hub.isLoading}>wait...</div>
      <PageComponent
        if={!hub.isLoading}
        ref:page
        hub={hub}
        model={hub.pageProps}
      />
    </div>
  );
  Wrapper.methods = {
    render(model, parentCtrl) {
      //@ts-ignore
      const page = this.ref.page.get();
      this.hub = new Controller(this, page, parentCtrl);
      this.hub.init(model);
    },
  };
  return Wrapper;
}

// TODO: try with a stub and load method.

export const PageWrapper: Uses<{
  __compound: true;
  model: RouteData;
  // rename methods to self?
  methods: {
    isLoading: boolean;
    pageProps: any;
    load: (model: RouteData) => Promise<any>;
  };
  stub: { page: ComponentFunction<any> };
}> = (_, { hub, stub, self }) => (
  <div class="pageLoader">
    <div if={self.isLoading}>wait...</div>
    <stub.page if={!self.isLoading} ref:page model={self.pageProps} />
  </div>
);

PageWrapper.methods = {
  render(model) {
    this.isLoading = true;
    this.update();
    this.load(model).then((pageProps) => {
      this.isLoading = false;
      this.pageProps = pageProps;
      this.update();
    });
  },
};
