const db = require("../../db");
const categories = ["Tshirts", "Sweatshirts", "Outerwears", "Accessories", "Pins", "Home Goods", "Toys", "Books", "Bags", "Pants", "Shoes","Others"];


module.exports = app => {
    /**
     * Get everything in inventory
     */
    app.get("/v1/inventory", async (req, res) => {
        const sqlCommand = "SELECT * FROM item INNER JOIN inventory ON item.id = inventory.id;";
        db.query(sqlCommand, (error, result) => {
            if(error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to get all items from inventory"}));
            }
            else{
                result = result.map(d => {
                    return {
                        id: d.id,
                        name: d.name,
                        category: categories.indexOf(d.category),
                        weight: d.weight,
                        purchase_date: d.purchase_date,
                        cost: d.cost
                    }
                });
                res.status(200).send(JSON.stringify(result));
            }
        });
    });

    /**
     * Add item to inventory
     */
    app.post("/v1/inventory", async (req, res) => {
        const data = req.body;
        const sqlCommand = `INSERT INTO item (name, category, weight, purchase_date, cost) VALUES ("${data.name}", "${data.category}", "${data.weight}", "${data.purchase_date}", ${data.cost});`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to insert item into inventory"}));
            }
            else{
                res.status(200).send(JSON.stringify({id: result.insertId}));
            }
        });
    });

    /**
     * Update item with the given id
     */
    app.put("/v1/inventory/:id", async (req, res) => {
        const data = req.body;
        const id = req.params.id;
        const sqlCommand = `UPDATE item SET name = "${data.name}", category = "${data.category}", weight = "${data.weight}", purchase_date = "${data.purchase_date}", cost = "${data.cost}" WHERE id = ${id};`
        db.query(sqlCommand, (error, result) => {
            if(error) {
                res.status(400).send(JSON.stringify({err: `Error while trying to update item with id: ${id}`}));
            }
            else{
                res.status(200).send(JSON.stringify({success: "Update successful"}));
            }
        });
    });

    /**
     * Delete item with the given id
     */
    app.delete("/v1/inventory/:id", async (req, res) => {
        const id = req.params.id;
        const sqlCommand = `DELETE FROM item WHERE id = ${id};`;
        db.query(sqlCommand, (error, result) => {
            if(error){
                res.status(400).send(JSON.stringify({err: `Error while trying to delete item with id: ${id}`}));
            }
            else{
                res.status(200).send(JSON.stringify({success: "Delete successful"}));
            }
        })
    });

    /**
     * Get inventory count by category
     */
    app.get("/v1/inventory/count", async (req, res) => {
        const sqlCommand = `SELECT category, COUNT(*) as count FROM item INNER JOIN inventory ON item.id = inventory.id GROUP BY category;`;
        db.query(sqlCommand, (error, result) => {
            if(error){
                res.status(400).send(JSON.stringify({err: `Error while trying to get inventory count`}));
            }
            else{
                res.status(200).send(JSON.stringify(result));
            }
        })
    });
}