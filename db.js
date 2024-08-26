let sqlite3 = require('sqlite3');
const fs = require('fs')
const path = require('path');
const geolib = require('geolib');

module.exports.REGTYPE_TOKEN = "token";
module.exports.REGTYPE_GOOGLE = "google";

module.exports.Config = class Config {

    constructor() {
        if (!fs.existsSync("config.json")) {
            console.error("Config not found! Copying standard config file. Please adjust.");
            fs.copyFileSync(path.resolve(__dirname, "config.json.template"), "config.json")
        }
        this.config = JSON.parse(fs.readFileSync("config.json").toString());
        this.defaultConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config.json.template")).toString());
    }

    registrationEnabled(regType) {
        if ('registration' in this.config && regType in this.config['registration'] && 'enabled' in this.config['registration'][regType]) {
            return this.config['registration'][regType]['enabled'];
        } else {
            return false;
        }
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
        if ('webserver' in this.config && 'port' in this.config['webserver']) {
            return parseInt(this.config['webserver']['port']);
        } else {
            return this.defaultConfig['webserver']['port'];
        }
    }

    getBindAddress() {
        if ('webserver' in this.config && 'bind' in this.config['webserver']) {
            return this.config['webserver']['bind'];
        } else {
            return this.defaultConfig['webserver']['bind'];
        }
    }

    getLang(stringName) {
        if ('lang' in this.config && stringName in this.config['lang']) {
            return this.config['lang'][stringName];
        } else {
            return this.defaultConfig['lang'][stringName];
        }
    }

    getClientLang() {
        if ('client' in this.config && 'lang' in this.config['client']) {
            return {...this.defaultConfig['client']['lang'], ...this.config['client']['lang']};
        } else {
            return this.defaultConfig['client']['lang'];
        }
    }

    getMaxDistance() {
        if ('geo' in this.config && 'maxDistance' in this.config['geo']) {
            return this.config['geo']['maxDistance'];
        } else {
            return this.defaultConfig['geo']['maxDistance'];
        }
    }

    getMinSingleDistance() {
        if ('geo' in this.config && 'minSingleDistance' in this.config['geo']) {
            return this.config['geo']['minSingleDistance'];
        } else {
            return this.defaultConfig['geo']['minSingleDistance'];
        }
    }

    getMapOptions() {
        if ('map' in this.config) {
            return {...this.defaultConfig['map'], ...this.config['map']};
        } else {
            return this.defaultConfig['map'];
        }
    }

    getShowDistanceForCorrect() {
        if ('client' in this.config && 'showDistanceForCorrect' in this.config['client']) {
            return this.config['client']['showDistanceForCorrect'];
        } else {
            return this.defaultConfig['client']['showDistanceForCorrect'];
        }
    }

    getShowWhichWrong() {
        if ('client' in this.config && 'showWhichWrong' in this.config['client']) {
            return this.config['client']['showWhichWrong'];
        } else {
            return this.defaultConfig['client']['showWhichWrong'];
        }
    }

    getShowManualCoordinatesPrompt() {
        if ('client' in this.config && 'showManualCoordinatesPrompt' in this.config['client']) {
            return this.config['client']['showManualCoordinatesPrompt'];
        } else {
            return this.defaultConfig['client']['showManualCoordinatesPrompt'];
        }
    }

    getAllowCheckWhileNotAllSet() {
        if ('client' in this.config && 'allowCheckWhileNotAllSet' in this.config['client']) {
            return this.config['client']['allowCheckWhileNotAllSet'];
        } else {
            return this.defaultConfig['client']['allowCheckWhileNotAllSet'];
        }
    }

    getShowCurrentQuest() {
        if ('client' in this.config && 'showCurrentQuest' in this.config['client']) {
            return this.config['client']['showCurrentQuest'];
        } else {
            return this.defaultConfig['client']['showCurrentQuest'];
        }
    }

    getGuidedOptions() {
        if ('client' in this.config && 'guided' in this.config['client']) {
            return {...this.defaultConfig['client']['guided'], ...this.config['client']['guided']};
        } else {
            return this.defaultConfig['client']['guided'];
        }
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
            this.db.run("CREATE TABLE position (id integer primary key autoincrement, name STRING, lat INT, long INT, image STRING)")
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
            this.db.all("SELECT  id, name, usersPositions.lat, usersPositions.long, image FROM position LEFT JOIN (SELECT * FROM userPositions WHERE userPositions.user = (SELECT id FROM user WHERE token=?)) AS usersPositions ON position.id = usersPositions.position", token, function (err, rows) {
                resolve(rows);
            });
        }.bind(this));
    }

    setPos(token, id, lat, long) {
        return new Promise(function (resolve, reject) {
            if (typeof lat !== "number" || typeof long !== "number") {
                reject("Not correct type");
                return;
            }
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

    getDists(token, rejectWhenNotAllSet = true) {
        return new Promise(function (resolve, reject) {
            let dists = {};
            this.db.each("SELECT id, name, usersPositions.lat AS userLat, usersPositions.long AS userLong, position.lat, position.long FROM position LEFT JOIN (SELECT * FROM userPositions WHERE userPositions.user = (SELECT id FROM user WHERE token=?)) AS usersPositions ON position.id = usersPositions.position", token, function(err, row) {
                let distance = undefined;
                if (row['userLat'] == null || row['userLong'] == null) {
                    if (rejectWhenNotAllSet) resolve(null);
                    distance = Number.MAX_SAFE_INTEGER
                }
                if (!distance) distance =
                    geolib.getDistance({latitude: row['lat'], longitude: row['long']}, {latitude: row['userLat'], longitude: row['userLong']});
                dists[row['id']] = {distance: distance, name: row['name']};
            }, function () {
                resolve(dists);
            })
        }.bind(this))
    }
}
