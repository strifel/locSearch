const express = require('express');
const dbManager = require('./db');
const fs = require('fs');
const Twig = require("twig");
const bodyParser = require('body-parser');

let app = express();
let db = new dbManager.SQLite();
let config = new dbManager.Config();

app.use('/image', express.static('image'));
app.use(bodyParser.urlencoded());

app.set('views', './web/templates');


let files = fs.readdirSync("image/");

app.get("/", (req, res) => {
    if (files.length > 0) {
        res.render('install.twig', {
            file: files[0]
        })
    } else {
        res.send("Fertig")
    }
})

app.post("/", (req, res) => {
    let filename = req.body['filename'];
    let name = req.body['name'];
    let lat = req.body['lat'];
    let long = req.body['long'];
    fs.renameSync("image/" + files[0], "image/" + filename);
    db.db.run("INSERT INTO position (name, image, lat, long) VALUES (?,?,?,?)", name, filename, lat, long);
    files.shift()
    res.render('install.twig', {
        file: files[0]
    })
})

app.post("/skip", (req, res) => {
    files.shift();
    res.send("ok");
})

app.listen(config.getWebserverPort(), "127.0.0.1")
