"use strict";
const Router = new (class {
    options = {
        ignoreSegment: 0,
    };
    Route = class {
        routes = {
            _404: () => `
            <!DOCTYPE html>
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
            `,
        };
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
    routes = {
        _404: () => `
        <!DOCTYPE html>
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
        return {
            segment: segment.startsWith("|") ? segment.slice(1) : segment,
            dynamic: false,
        };
    }
    getParams(params) {
        const obj = {};
        new URLSearchParams(location.search).forEach((v, k) => (obj[k] = v));
        if (obj.redirect) {
            const url = obj.redirect;
            delete obj.redirect;
            return "?redirect=" + url + (Object.keys(params).length > 0
                ? "&" + Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")
                : "") + (Object.keys(obj).length > 0
                ? "&" + Object.entries(obj).map(([k, v]) => `${k}=${v}`).join("&")
                : "");
        }
        return "?redirect=" +
            location.href.slice(0, location.href.length - location.search.length) + (Object.keys(params).length > 0
            ? "&" + Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")
            : "") + (Object.keys(obj).length > 0 ? "&params=" + JSON.stringify(obj) : "");
    }
    start() {
        this.start = () => {
            console.warn("start method already called");
        };
        const url = location.href.slice(0, location.href.length - location.search.length).split("/").filter((v) => v !== "");
        const ignored = [];
        for (let i = 0; i < 2 + this.options.ignoreSegment; i++) {
            ignored.push(url.shift());
        }
        for (const [k, v] of Object.entries(this.routes)) {
            const route = k.split("/").filter((v) => v !== "");
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
                if (v instanceof Function) {
                    const obj = {};
                    new URLSearchParams(location.search).forEach((v, k) => (obj[k] = v));
                    let URLParams = "";
                    const params = {};
                    if (obj.params) {
                        URLParams = "?" +
                            Object.entries(JSON.parse(obj.params)).map(([k, v]) => {
                                params[k] = v;
                                return `${k}=${v}`;
                            }).join("&");
                        delete obj.params;
                    }
                    if (obj.redirect) {
                        history.replaceState(null, "", obj.redirect + URLParams);
                        delete obj.redirect;
                    }
                    Object.entries(obj).forEach(([k, v]) => params[k] = v);
                    const r = v(params);
                    if (typeof r === "string") {
                        document.open();
                        document.write(r);
                        document.close();
                    }
                    else if (r instanceof Element) {
                        document.open();
                        document.write(r.outerHTML);
                        document.close();
                    }
                }
                else {
                    ignored.splice(1, 0, "");
                    window.open(ignored.join("/") + v + this.getParams(params), "_self");
                }
                return;
            }
        }
        ignored.splice(1, 0, "");
        window.open(ignored.join("/") + "/_404" + this.getParams({}), "_self");
    }
})();
