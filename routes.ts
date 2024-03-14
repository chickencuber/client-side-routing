Router.options.ignoreSegment = 1;

Router.route("/", "./number.html", (route: Route) => {
    route.route(":amount", "./number.html");
}).start();
