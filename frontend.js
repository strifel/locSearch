let db;
let auth;
let config;

module.exports.registerRoutes = function registerRoutes(app, database, authHandler, configHandler) {
    app.get('/', index);
    db = database;
    auth = authHandler;
    config = configHandler;
}

function index(req, res) {
    auth.isAuthorized(req).then((valid) => {
       if (valid) {
           let startOptions = config.getStartOptions();
           db.getPositions(auth.getToken(req)).then((positions) => {
               res.render('map.twig', {
                   lang: config.getClientLang(),
                   positions: JSON.stringify(positions),
                   startLong: startOptions['long'],
                   startLat: startOptions['lat'],
                   startZoom: startOptions['zoom']
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
