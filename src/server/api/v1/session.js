module.exports = app => {
    app.post("/v1/session", (req, res) => {
        const username = "c51613ba83cfe16815fb6d0a559ade20074076a638b4e6cee13dda3c372805a7";
        const password = "19240b583023070a9216a3a08eeb2859b1a99ebe054ff7aae563e17bae9bc549";
        if(req.body.username == username && req.body.password == password){
            res.status(200).send(JSON.stringify({success: "Success"}));
        }
        else{
            res.status(401).send(JSON.stringify({err: "Unauthorized"}));
        }
    })
}