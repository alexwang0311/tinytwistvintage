module.exports = app => {
    app.post("/v1/session", (req, res) => {
        const username = "c51613ba83cfe16815fb6d0a559ade20074076a638b4e6cee13dda3c372805a7";
        const password = "f0f6f0099a18c32189697c8e7dab8ca1a19a54a2372f312810a401de31f4346b";
        if(req.body.username == username && req.body.password == password){
            res.status(200).send(JSON.stringify({success: "Success"}));
        }
        else{
            res.status(401).send(JSON.stringify({err: "Unauthorized"}));
        }
    })
}