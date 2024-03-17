"use strict";
const Router = new (class {
    options = {
        ignoreSegment: 0,
    };
    Route = class {
        routes = {};
        route(route, location, children) {
            this.routes[route] = location;
            if (children instanceof Function) {
                const self = new Router.Route();
                children(self);
                for (const [k, v] of Object.entries(self.routes)) {
                    this.routes[route + k] = v;
                }
            }
            return this;
        }
    };
    routes = {};
    route(route, location, children) {
        this.routes[route] = location;
        if (children instanceof Function) {
            const self = new Router.Route();
            children(self);
            for (const [k, v] of Object.entries(self.routes)) {
                this.routes[route + k] = v;
            }
        }
        return this;
    }
    parseSegment(segment) {
        if (segment.startsWith(":")) {
            return { segment: segment.slice(1), dynamic: true };
        }
        return { segment: segment.startsWith("|") ? segment.slice(1) : segment, dynamic: false };
    }
    start() {
        const url = location.href.slice(0, location.href.length - location.search.length).split("/").filter(v => v !== "");
        const ignored = [];
        for (let i = 0; i < 2 + this.options.ignoreSegment; i++) {
            ignored.push(url.shift());
        }
        for (const [k, v] of Object.entries(this.routes)) {
            const route = k.split("/").filter(v => v !== "");
            console.log(url, route);
            if (route.length !== url.length)
                continue;
            let e = true;
            const params = {};
            for (const [u, r] of structuredClone(url).map((v, i) => [v, route[i]])) {
                const parsedRoute = this.parseSegment(r);
                if (parsedRoute.dynamic) {
                    params[parsedRoute.segment] = u;
                }
                else {
                    if (u !== parsedRoute.segment) {
                        e = false;
                        break;
                    }
                }
            }
            if (e) {
                ignored.splice(1, 0, "");
                console.log(ignored.join("/") + v);
                window.open(ignored.join("/") + v, "_self");
            }
        }
    }
})();
