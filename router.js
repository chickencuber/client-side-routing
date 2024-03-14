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
    start() {
        console.log(location.href);
    }
})();
