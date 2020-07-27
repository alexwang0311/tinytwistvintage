const express = require("express");
const config = require("../../config/config.json");
const path = require("path");
const bodyParser = require("body-parser");
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const db = require('./db');
const moment = require("moment");

const setupServer = async () => {
    let app = express();

    app.engine("pug", require("pug").__express);
    app.set("views", __dirname);
    
    //configure middlewares
    app.use(express.static(path.join(__dirname, "../../public")));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    require("./api")(app);

    app.get("*", (req, res) => {
        res.render("base.pug");
    })

    app.listen(config.port, () => {
        console.log(`listening on port ${config.port}`);
    });
};

setupServer();

const crawler = async () => {
    const nightmare = Nightmare({ show: false })
    const url = "https://www.depop.com/tinytwists/";

    // Request making using nightmare
    nightmare
    .goto(url)
    .wait('body')
    .evaluate(() => document.querySelector('body').innerHTML)
    .end()
    .then(response => {
        getData(response);
    }).catch(err => {
        console.log(err);
    });

    // Parsing data using cheerio
    const getData = html => {
        const $ = cheerio.load(html);
        $('.styles__StatsValue-sc-9h44if-0').each((i, elem) => {
            if(i == 0){
                const follower = $(elem).text();
                const sqlCommand = `INSERT INTO follower (count, timestamp) VALUES (${follower}, '${moment().format('YYYY-MM-DD hh:mm:ss')}');`;
                db.query(sqlCommand, (error, result) => {
                    if(error) {
                        console.log("Error while trying to log follower count");
                    }
                    else{
                        console.log(`Follower: ${follower} at ${moment().format('YYYY-MM-DD hh:mm:ss')}`);
                    }
                });
                
            }
        });
    }
};

//crawl every hour
const crawlOnInterval = () => {
    crawler();
    setTimeout(crawlOnInterval, 1000 * 60 * 60 * 2);
};

crawlOnInterval();
