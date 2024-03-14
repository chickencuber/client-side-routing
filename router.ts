interface Route {
    route: (route: string, location: string | ((params: Record<string, string>) => string | Element), children?: (route: Route) => void) => this;
}

const Router = new (class {
    options: {
        ignoreSegment: number
    } = {
        ignoreSegment: 0
    }
    private Route = class implements Route {
        route() {
            return this;
        }
    }
    routes: Record<string, string> = {};
    route(route: string, location: string, children?: (self: Route) => void): this {
        return this;
    }
    start() {

    }
})()
