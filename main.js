var express = require('express');
const bodyParser = require('body-parser');
var crypto = require("crypto");
var app = express();
const dbManager = require('./db');
var config = new dbManager.Config();
var db = new dbManager.SQLite();
const auth = require('./auth');
auth.db = db;
app.use(express.static('web'));
app.use(bodyParser.json())


app.get('/api', function (req, res) {
    res.json({"message": "Hello World!"});
    auth.isAuthorized()
});

app.get('/api/isAuthorized', function (req, res) {
    if (req.query.token) {
        auth.isAuthorized(req, res).then((value) => {
            if (value) {
                res.json({"message": "Token is valid", "valid": true});
            }
        }).catch(() => {});
    }
});

app.post('/api/register/token', function (req, res) {
    if (!config.registrationEnabled(dbManager.REGTYPE_TOKEN)) {
        res.status(403).json({"error": "Token based registration is not allowed"})
        return
    }
    let token = crypto.randomBytes(32).toString('hex');
    db.registerUser(token, dbManager.REGTYPE_TOKEN);
    res.json({"message": "Created user.", "token": token});
});

app.get('/api/register', function (req, res) {
   res.json(config.getRegistrationOptions());
});

app.put('/api/positions', function (req, res) {
    // Body has to have id, long and lat
    auth.isAuthorized(req, res).then((() => {
        if ('id' in req.body && 'long' in req.body && 'lat' in req.body) {
            db.setPos(auth.getToken(req), req.body['id'], req.body['lat'], req.body['long']).then(() => {
                db.getPositions(req.query.token).then((result) => {
                    res.json({"message": "Saved position", positions: result})
                })
            });
        } else {
            res.status(400).json({"error": "Wrong Body!"})
        }
    })).catch(() => {});
});

app.get('/api/positions', function (req, res) {
    auth.isAuthorized(req, res).then((() => {
        db.getPositions(auth.getToken(req)).then((result) => {
            res.json({"message": "There are positions", positions: result})
        })
    })).catch(() => {});
});

// Validates the positions
app.post('/api/positions', function (req, res) {
    auth.checkAuthorization(req, res).then(() => {
        db.getDistance(auth.getToken(req), config.getMinSingleDistance()).then(distance =>  {
           if (distance == null) {
               res.status(428).json({"error": "Not all position set."});
           } else {
               res.json({"message": distance > config.getMaxDistance() ? config.getLang("finishWrongMessage").replace("{meters}", distance) : config.getLang("finishMessage"), "distance": distance})
           }
        });
   }).catch(() => {});
});

app.listen(config.getWebserverPort(), config.getBindAddress(), function () {
    console.log(`Running app on port ${config.getWebserverPort()}!`);
});
