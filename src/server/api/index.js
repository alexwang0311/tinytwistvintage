module.exports = app => {
    require("./v1/store")(app);
    require("./v1/inventory")(app);
    require("./v1/order")(app);
    require("./v1/stats")(app);
    require("./v1/session")(app);
};