import { ComponentInstance, ComponentFunction, Uses, RouteData } from "wallace";

/**
 * Base class for a Hub that controls a page. Use with `wrapPage` helper.
 * You must implement the `load` method which should set the `model` which is
 * passed to the page component.
 */
export class WrappedPageHub<Model> {
  isLoading: boolean = true;
  wrapper: ComponentInstance<RouteData>;
  page: ComponentInstance<Model>;
  model: Model;
  parentHub: any;
  constructor(
    wrapper: ComponentInstance<RouteData>,
    page: ComponentInstance<Model>,
    parentHub: any
  ) {
    this.wrapper = wrapper;
    this.page = page;
    this.wrapper.hub = this.page.hub = this;
    this.parentHub = parentHub;
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
 * Wraps a page component inside a wrapper component which displays a progress
 * bar while the page is loading.
 * Must pass a Hub derived from WrappedPageHub.
 *
 * @param PageComponent
 * @param Hub
 * @returns a Wrapper component
 */
export function wrapPage<Model>(
  PageComponent: ComponentFunction<Model>,
  Hub: typeof WrappedPageHub<Model>
) {
  const Wrapper: Uses<{ model: RouteData; hub: WrappedPageHub<Model> }> = (
    _,
    { hub }
  ) => (
    <div class="pageLoader">
      <div if={hub.isLoading}>wait...</div>
      <PageComponent if={!hub.isLoading} ref:page hub={hub} model={hub.model} />
    </div>
  );
  Wrapper.methods = {
    // Does parentHub work?
    render(routeData, parentHub) {
      // When we use `ref` on nested components we get a nester. Not ideal...
      //@ts-ignore
      const page = this.ref.page.get();
      this.hub = new Hub(this, page, parentHub);
      this.hub.init(routeData);
    },
  };
  return Wrapper;
}

// TODO: remove this:

export const PageWrapper: Uses<{
  __compound: true;
  model: RouteData;
  // rename methods to self?
  methods: {
    isLoading: boolean;
    pageModel: any;
    load: (model: RouteData) => Promise<any>;
  };
  stub: { page: ComponentFunction<any> };
}> = (_, { hub, stub, self }) => (
  <div class="pageLoader">
    <div if={self.isLoading}>wait...</div>
    <stub.page if={!self.isLoading} ref:page model={self.pageModel} />
  </div>
);

PageWrapper.methods = {
  render(model) {
    this.isLoading = true;
    this.update();
    this.load(model).then((pageModel) => {
      this.isLoading = false;
      this.pageModel = pageModel;
      this.update();
    });
  },
};
