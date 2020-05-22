let sqlite3 = require('sqlite3');
const fs = require('fs')

module.exports.REGTYPE_TOKEN = "token";
module.exports.REGTYPE_GOOGLE = "google";

module.exports.Config = class Config {

    constructor() {
        if (!fs.existsSync("config.json")) {
            console.error("Config not found! Copying standard config file. Please adjust.");
            fs.copyFileSync("config.json.template", "config.json")
        }
        this.config = JSON.parse(fs.readFileSync("config.json").toString());
    }

    registrationEnabled(regType) {
        return this.config['registration'][regType]['enabled'];
    }

    getRegistrationOptions() {
        let reg = {};
        if (this.registrationEnabled(module.exports.REGTYPE_TOKEN)) {
            reg['token'] = {}
        }
        if (this.registrationEnabled(module.exports.REGTYPE_GOOGLE)) {
            reg['google'] = {"registrationLink": this.config['registration']['google']['registrationLink']}
        }
        return reg;
    }

    getWebserverPort() {
        return parseInt(this.config['webserver']['port']);
    }

    getBindAddress() {
        return this.config['webserver']['bind'];
    }
}

module.exports.SQLite = class SQLite {
    constructor() {
        let dbExists = false;
        if (fs.existsSync("database.sqlite")) dbExists = true;
        this.db = new sqlite3.Database('database.sqlite');
        // Database creation/token loading
        if (!dbExists) {
            this.db.run("CREATE TABLE user (id integer primary key autoincrement, token VARCHAR(32), registrationType VARCHAR(12))");
            this.db.run("CREATE TABLE position (id integer primary key autoincrement, name STRING, lat INT, long INT)")
            this.db.run("CREATE TABLE userPositions (position INT, user INT,lat INT, long INT)")
        }
    }
    registerUser(token, registrationType) {
        this.db.run("INSERT INTO user (token, registrationType) VALUES (?, ?)", token, registrationType)
    }
    isTokenValid(token) {
        return new Promise(function(resolve, reject) {
            this.db.get("SELECT id FROM user WHERE token=?", token, function(err, rows) {
                resolve(rows !== undefined)
            });
        }.bind(this));
    }
    getPositions(token) {
        // This combines user entered positions with positions
        return new Promise(function (resolve, reject) {
            this.db.all("SELECT  id, name, usersPositions.lat, usersPositions.long FROM position LEFT JOIN (SELECT * FROM userPositions WHERE userPositions.user = (SELECT id FROM user WHERE token=?)) AS usersPositions ON position.id = usersPositions.position", token, function (err, rows) {
                resolve(rows);
            });
        }.bind(this));
    }

    setPos(token, id, lat, long) {
        return new Promise(function (resolve, reject) {
            this.db.get("SELECT id FROM user WHERE token=?", token, function(err, row) {
                let user = row['id'];
                this.db.get("SELECT position FROM userPositions WHERE position=? AND user=?", id, user, function (err, row) {
                    if (row == null) {
                        this.db.run("INSERT INTO userPositions (user, position, lat, long) VALUES (?, ?, ?, ?)", user, id, lat, long, resolve);
                    } else {
                        this.db.run("UPDATE userPositions SET lat=?, long=? WHERE user=? AND position=?", lat, long, user, id, resolve)
                    }
                }.bind(this))
            }.bind(this));
        }.bind(this));
    }
}

