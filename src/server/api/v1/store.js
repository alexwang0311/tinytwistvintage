const db = require("../../db");

module.exports = app => {
    /**
     * Get everything in store
     */
    app.get("/v1/store", async (req, res) => {
        const sqlCommand = `SELECT * FROM item INNER JOIN store ON item.id = store.id;`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to get all items from store"}));
            }
            else{
                res.status(200).send(JSON.stringify(result));
            }
        });
    });

    /**
     * Post an item to the store with the given id
     */
    app.post("/v1/store/:id", async (req, res) => {
        const data = req.body;
        const id = req.params.id;
        const sqlCommand = `DELETE FROM inventory WHERE id = ${id}; INSERT INTO store (id, listing_date, listing_price) VALUES ("${id}", "${data.listing_date}", "${data.listing_price}");`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to insert item into store"}));
            }
            else{
                res.status(200).send(JSON.stringify({id: result.insertId}));
            }
        });
    });

    /**
     * Update the item in store with the given id
     */
    app.put("/v1/store/:id", async (req, res) => {
        const data = req.body;
        const id = req.params.id;
        const sqlCommand = `UPDATE store SET listing_date = "${data.listing_date}", listing_price = ${data.listing_price} WHERE id = ${id};`;
        db.query(sqlCommand, (error, result) => {
            if (error) {
                res.status(400).send(JSON.stringify({err: "Error while trying to update item in store"}));
            }
            else{
                res.status(200).send(JSON.stringify({id: result.insertId}));
            }
        });
    });

    /**
     * Delete item in store with the given id and put it back to inventory
     */
    app.delete("/v1/store/:id", async (req, res) => {
        const id = req.params.id;
        const sqlCommand = `DELETE FROM store WHERE id = ${id}; INSERT INTO inventory (id) VALUES (${id});`;
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
     * Get store item count by category
     */
    app.get("/v1/store/count", async (req, res) => {
        const sqlCommand = `SELECT category, COUNT(*) as count FROM item INNER JOIN store ON item.id = store.id GROUP BY category;`;
        db.query(sqlCommand, (error, result) => {
            if(error){
                res.status(400).send(JSON.stringify({err: `Error while trying to get store count`}));
            }
            else{
                res.status(200).send(JSON.stringify(result));
            }
        })
    });
}