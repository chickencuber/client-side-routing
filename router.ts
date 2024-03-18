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
    > = {
      _404: () => `
      <html lang="en">
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <main>
            <div>404<br/>page not found</div>
          </main>
        </body>
      </html>
      `
    };
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
      location.search,
    ).forEach((v, k) => (obj[k] = v));
    if (obj.redirect) {
      const url = obj.redirect;
      delete obj.redirect;
      return "?redirect=" + url + (
        Object.keys(params).length > 0
          ? "&" + Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")
          : ""
      ) + (
        Object.keys(obj).length > 0
          ? "&" + Object.entries(obj).map(([k, v]) => `${k}=${v}`).join("&")
          : ""
      );
    }
    return "?redirect=" +
      location.href.slice(0, location.href.length - location.search.length) + (
        Object.keys(params).length > 0
          ? "&" + Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")
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
        if (v instanceof Function) {
          const obj: Record<string, string> = {};
          new URLSearchParams(
          location.search,
          ).forEach((v, k) => (obj[k] = v));
          let URLParams = "";
          const params: Record<string, string> = {};
          if(obj.params) {
            URLParams = "?" + Object.entries(JSON.parse(obj.params)).map(([k, v]) => {
              params[k] = v as string;
              return `${k}=${v}`;
            }).join("&");
            delete obj.params
          }
          if(obj.redirect) {
            history.replaceState(null, "", obj.redirect + URLParams);
            delete obj.redirect;
          }
          Object.entries(obj).forEach(([k, v]) => params[k] = v);
          const r = v(params);
          if(typeof r === "string") {
            document.open();
            document.write(r);
            document.close();
          } else if (r instanceof Element) {
            document.open();
            document.write(r.outerHTML);
            document.close();
          }
        } else {
          ignored.splice(1, 0, "");
          window.open(ignored.join("/") + v + this.getParams(params), "_self");
        }
      }
    }
    ignored.splice(1, 0, "");
    //window.open(ignored.join("/") + "_404" + this.getParams(params), "_self");
  }
})();
