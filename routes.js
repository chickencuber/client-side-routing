"use strict";
Router.options.ignoreSegment = 1;
Router.route("/", "/number.html", (route) => {
    route.route("/:amount", "/");
}).start();
