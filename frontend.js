let db;
let auth;
let config;
let game;

module.exports.registerRoutes = function registerRoutes(app, database, authHandler, configHandler, gameHandler) {
    app.get('/', index);
    app.get('/check', check);
    db = database;
    auth = authHandler;
    config = configHandler;
    game = gameHandler;
}

function index(req, res) {
    auth.isAuthorized(req).then((valid) => {
       if (valid) {
           let mapOptions = config.getMapOptions();
           db.getPositions(auth.getToken(req)).then((positions) => {
               res.render('map.twig', {
                   lang: config.getClientLang(),
                   currentPositions: JSON.stringify(positions),
                   positionOptions: positions,
                   startLong: mapOptions['startOptions']['long'],
                   startLat: mapOptions['startOptions']['lat'],
                   startZoom: mapOptions['startOptions']['zoom'],
                   mapLayers: mapOptions['layers'],
                   showManualCoordinatesPrompt: config.getShowManualCoordinatesPrompt(),
                   customScripts: mapOptions['customScripts']
               })
           })
       } else {
           res.render('login.twig', {
               authBackends: config.getRegistrationOptions(),
               lang: config.getClientLang()
           })
       }
    });
}

function check(req, res) {
    auth.checkAuthorization(req, res).then(() => {
        game.getDistance(db, config, auth.getToken(req)).then((response) => {
            res.render('check.twig', {
                lang: config.getClientLang(),
                response: response,
                showCorrectDistances: config.getShowDistanceForCorrect()
            })
        }).catch((response) => {
            res.render('check.twig', {
                lang: config.getClientLang(),
                response: response
            })
        })
    }).catch(() => {});
}
