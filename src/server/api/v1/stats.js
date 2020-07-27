const db = require("../../db");
const _ = require("lodash");

module.exports = app => {
    app.get("/v1/stats/order", async (req, res) => {
        const sqlCommand = "SELECT ROUND(SUM(revenue), 2) AS revenue, ROUND(SUM(net_profit), 2) AS profit, order_date FROM sale WHERE YEARWEEK(`order_date`, 0) = YEARWEEK(CURDATE(), 0) GROUP BY order_date;";
        db.query(sqlCommand, (error, result) => {
            if(error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to get order stats"}));
            }
            else{
                res.status(200).send(JSON.stringify(result));
            }
        });
    });

    app.get("/v1/stats/sale", async (req, res) => {
        const sqlCommand = "CALL GetSaleStats();";
        db.query(sqlCommand, (error, result) => {
            if(error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to get balance"}));
            }
            else{
                res.status(200).send(JSON.stringify(result[0][0]));
            }
        });
    });

    app.get("/v1/stats/follower", async (req, res) => {
        const sqlCommand = "SELECT count, DATE(timestamp) AS date FROM follower WHERE YEARWEEK(`timestamp`, 0) = YEARWEEK(CURDATE(), 0);";
        db.query(sqlCommand, (error, result) => {
            if(error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to get follower"}));
            }
            else{
                let tmp = [];
                result = _.chain(result)
                            .groupBy("date")
                            .map(d => d[d.length - 1])
                            .map((d, index) => {
                                tmp.push(d.count);
                                return {
                                    count: d.count,
                                    increase: index == 0 ? 0 : d.count - tmp[index - 1],
                                    date: d.date
                                };
                            });
                res.status(200).send(JSON.stringify(result));
            }
        });
    });
}