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
  private parseSegment(segment: string): {segment: string, dynamic: boolean} {
    if(segment.startsWith(":")) {
      return {segment: segment.slice(1), dynamic: true};
    }
    return {segment: segment.startsWith("|")? segment.slice(1): segment, dynamic: false};
  }
  private getParams(params: Record<string, string>): string {
    return (location.search === ""?
     "?":
     location.search + (Object.keys(params).length > 0?
     "&" + Object.entries(params).map(([k, v]) => k + "=" + v).join("&"):
     ""));
  }
  start() {
    const url = location.href.slice(0, location.href.length - location.search.length).split("/").filter(v => v !== "");
    const ignored: string[] = [];
    for(let i = 0; i < 2 + this.options.ignoreSegment; i++) {
      ignored.push(url.shift()!);
    }

    for(const [k, v] of Object.entries(this.routes)) {
      const route = k.split("/").filter(v => v !== "");
      if(route.length !== url.length) continue;
      let e = true;
      const params: Record<string, string> = {};
      for(const [u, r] of structuredClone(url).map((v, i) => [v, route[i]])) {
        const parsedRoute = this.parseSegment(r);
        if(parsedRoute.dynamic) {
          params[parsedRoute.segment] = u;
        } else {
          if(u !== parsedRoute.segment) {
            e = false;
            break;
          }
        }
      }
      if(e) {
        ignored.splice(1, 0, "");
        window.open(ignored.join("/") + v + this.getParams(params), "_self");
      }
    }

  }
})();
