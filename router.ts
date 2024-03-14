interface Route {
  routes: Record<
    string,
    string | ((params: Record<string, string>) => string | Element)
  >;
  route: (
    route: string,
    location: string | ((params: Record<string, string>) => string | Element),
    children?: (route: Route) => void,
  ) => this;
}

const Router = new (class {
  options: {
    ignoreSegment: number;
  } = {
    ignoreSegment: 0,
  };
  private Route = class implements Route {
    routes: Record<
      string,
      string | ((params: Record<string, string>) => string | Element)
    > = {};
    route(
      route: string,
      location: string | ((params: Record<string, string>) => string | Element),
      children?: (route: Route) => void,
    ): this {
      this.routes[route] = location;
      if (children instanceof Function) {
        const self: Route = new Router.Route();
        children(self);
        for (const [k, v] of Object.entries(self.routes)) {
          this.routes[route + k] = v;
        }
      }
      return this;
    }
  };
  routes: Record<
    string,
    string | ((params: Record<string, string>) => string | Element)
  > = {};
  route(
    route: string,
    location: string | ((params: Record<string, string>) => string | Element),
    children?: (route: Route) => void,
  ): this {
    this.routes[route] = location;
    if (children instanceof Function) {
      const self: Route = new Router.Route();
      children(self);
      for (const [k, v] of Object.entries(self.routes)) {
        this.routes[route + k] = v;
      }
    }
    return this;
  }
  start() {
    console.log(location.href);
  }
})();
