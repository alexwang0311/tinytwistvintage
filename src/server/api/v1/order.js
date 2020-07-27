const db = require("../../db");

module.exports = app => {
    /**
     * Get all orders
     */
    app.get("/v1/order", async (req, res) => {
        const sqlCommand = `SELECT * FROM item INNER JOIN sale ON item.order_id = sale.order_id;`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to get all orders"}));
            }
            else{
                let payload = [];
                let usedOrderId = [];
                result.forEach(d => {
                    let item = {
                        id: d.id,
                        name: d.name,
                        category: d.category,
                        weight: d.weight,
                        purchase_date: d.purchase_date,
                        cost: d.cost
                    }
                    if(usedOrderId.indexOf(d.order_id) == -1){
                        payload.push({
                            order_id: d.order_id,
                            order_date: d.order_date,
                            total: d.total,
                            revenue: d.revenue,
                            net_profit: d.net_profit,
                            items: [
                                item
                            ]
                        });
                        usedOrderId.push(d.order_id);
                    }
                    else{
                        payload.forEach(pd => {
                            if(pd.order_id == d.order_id){
                                pd.items.push(item);
                            }
                        });
                    }
                });
                let newPayload = [];
                payload.forEach(d => {
                    const extraPayload = {
                        name: d.items.length == 1 ? d.items[0].name : `Bundle with ${d.items[0].name}`,
                        category: d.items.length == 1 ? d.items[0].category : "Bundle"
                    }
                    d = {...d, ...extraPayload};
                    newPayload.push(d);
                })
                res.status(200).send(JSON.stringify(newPayload));
            }
        });
    });

    /**
     * Add a new order
     * {
     *  items: {},
     *  total:
     *  order_date:
     * }
     */
    app.post("/v1/order", async (req, res) => {
        const data = req.body;
        const order_date = data.order_date;
        const items = data.items;
        const total = data.total;
        const revenue = total * 0.9;
        const total_cost = items.map(d => d.cost).reduce((a, b) => a + b, 0);
        const net_profit = revenue - total_cost;
        const sqlCommand = `INSERT INTO sale (order_date, total, revenue, net_profit) VALUES ("${order_date}", ${total}, ${revenue}, ${net_profit});`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to add new order"}));
            }
            else{
                let updateCommand = "";
                items.forEach(d => {
                    updateCommand += `UPDATE item SET order_id = ${result.insertId} WHERE id = ${d.id}; DELETE FROM store WHERE id = ${d.id}; `;
                });
                //console.log(updateCommand);
                db.query(updateCommand, (error, result) => {
                    if(error){
                        res.status(400).send({err: "Error while trying to update items with new order id"});
                    }
                    else{
                        res.status(200).send(JSON.stringify({id: result.insertId}));
                    }
                });
            }
        });
    });

    /**
     * Update order with the given id
     */
    app.put("/v1/order/:id", async (req, res) => {
        const data = req.body;
        const id = req.params.id;
        const sqlCommand = `UPDATE sale SET order_date = "${data.order_date}", total = ${data.total}, revenue = ${data.revenue}, net_profit = ${data.net_profit} WHERE order_id = ${id};`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to update order"}));
            }
            else{
                res.status(200).send({});
            }
        });
    });

    /**
     * Delete order with the given id and put items back to store
     */
    app.delete("/v1/order/:id", async (req, res) => {
        const data = req.body;
        const id = req.params.id;
        let sqlCommand = `DELETE FROM sale WHERE order_id = ${id}; `;
        data.forEach(d => {
            sqlCommand += `UPDATE item SET order_id = NULL WHERE id = ${d.id}; INSERT INTO inventory (id) VALUES (${d.id}); `;
        });
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to delete order"}));
            }
            else{
                res.status(200).send({});
            }
        });
    });

    /**
     * Get sale count by category
     */
    app.get("/v1/order/count", async (req, res) => {
        const sqlCommand = `SELECT category, COUNT(*) as count FROM item INNER JOIN sale ON item.order_id = sale.order_id GROUP BY category;`;
        db.query(sqlCommand, (error, result) => {
            if(error){
                res.status(400).send(JSON.stringify({err: `Error while trying to get sale count`}));
            }
            else{
                res.status(200).send(JSON.stringify(result));
            }
        })
    });
}