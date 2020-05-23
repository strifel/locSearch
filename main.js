var express = require('express');
var cookies = require("cookie-parser")
const Twig = require("twig");
const bodyParser = require('body-parser');
const game = require('./game');
var crypto = require("crypto");
var app = express();
const dbManager = require('./db');
var config = new dbManager.Config();
var db = new dbManager.SQLite();
const auth = require('./auth');
const frontend = require('./frontend')
auth.db = db;
app.use('/static', express.static('web/static'));
app.use(bodyParser.json());
app.use(cookies())
app.set('views', './web/templates');
frontend.registerRoutes(app, db, auth, config, game);


app.get('/api', function (req, res) {
    res.json({"message": "Hello World!"});
    auth.checkAuthorization()
});

app.get('/api/checkAuthorization', function (req, res) {
    if (req.query.token) {
        auth.checkAuthorization(req, res).then((value) => {
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
    auth.checkAuthorization(req, res).then((() => {
        if ('id' in req.body && 'long' in req.body && 'lat' in req.body) {
            db.setPos(auth.getToken(req), req.body['id'], req.body['lat'], req.body['long']).then(() => {
                db.getPositions(auth.getToken(req)).then((result) => {
                    res.json({"message": "Saved position", positions: result})
                })
            });
        } else {
            res.status(400).json({"error": "Wrong Body!"})
        }
    })).catch(() => {});
});

app.get('/api/positions', function (req, res) {
    auth.checkAuthorization(req, res).then((() => {
        db.getPositions(auth.getToken(req)).then((result) => {
            res.json({"message": "There are positions", positions: result})
        })
    })).catch(() => {});
});

// Validates the positions
app.post('/api/positions', function (req, res) {
    auth.checkAuthorization(req, res).then(() => {
        game.getDistance(db, config, auth.getToken(req)).then((response) => {
            res.json(response);
        }).catch((response) => {
            res.status(428).json(response);
        })
   }).catch(() => {});
});

app.listen(config.getWebserverPort(), config.getBindAddress(), function () {
    console.log(`Running app on port ${config.getWebserverPort()}!`);
});
