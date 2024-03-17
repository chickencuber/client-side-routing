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

const urlParams = (() => {
  const obj: Record<string, string> = {};
  new URLSearchParams(location.search).forEach((v, k) => (obj[k] = v));
  const params: Record<string, string> = {};
  let urlParams = "";
  if(obj.params) {
      const p = Object.entries(JSON.parse(obj.params));
      p.forEach(([k, v]) => params[k] = v as string);
      urlParams = "?" + p.map(([k, v]) => `${k}=${v}`).join("&");
      delete obj.params;
  }
  if(obj.redirect) {
      history.replaceState(null, "", obj.redirect + urlParams);
      delete obj.redirect;
  }
  Object.entries(obj).forEach(([k, v]) => {
    params[k] = v;
  })
  Object.freeze(params);
  return params;
})()


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
  private parseSegment(segment: string): { segment: string; dynamic: boolean } {
    if (segment.startsWith(":")) {
      return { segment: segment.slice(1), dynamic: true };
    }
    return {
      segment: segment.startsWith("|") ? segment.slice(1) : segment,
      dynamic: false,
    };
  }
  private getParams(params: Record<string, string>): string {
    const obj: Record<string, string> = {};
    new URLSearchParams(
      "?" + Object.keys(urlParams).map(([k, v]) => `${k}=${v}`).join("&"),
    ).forEach((v, k) => (obj[k] = v));
    return "?redirect=" +
      location.href.slice(0, location.href.length - location.search.length) + (
        Object.keys(params).length > 0
          ? "&" + Object.keys(params).map(([k, v]) => `${k}=${v}`).join("&")
          : ""
      ) + (
        Object.keys(obj).length > 0 ? "&params=" + JSON.stringify(obj) : ""
      );
  }
  start() {
    const url = location.href.slice(
      0,
      location.href.length - location.search.length,
    ).split("/").filter((v) => v !== "");
    const ignored: string[] = [];
    for (let i = 0; i < 2 + this.options.ignoreSegment; i++) {
      ignored.push(url.shift()!);
    }

    for (const [k, v] of Object.entries(this.routes)) {
      const route = k.split("/").filter((v) => v !== "");
      if (route.length !== url.length) continue;
      let e = true;
      const params: Record<string, string> = {};
      for (const [u, r] of structuredClone(url).map((v, i) => [v, route[i]])) {
        const parsedRoute = this.parseSegment(r);
        if (parsedRoute.dynamic) {
          params[parsedRoute.segment] = u;
        } else {
          if (u !== parsedRoute.segment) {
            e = false;
            break;
          }
        }
      }
      if (e) {
        ignored.splice(1, 0, "");
        console.log(ignored.join("/") + v + this.getParams(params));
        //window.open(ignored.join("/") + v + this.getParams(params), "_self");
      }
    }
  }
})();
