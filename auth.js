module.exports.db = null;

module.exports.NotLoggedInError = function NotLoggedInError() {
    this.message = 'Not logged in!';
}

module.exports.isAuthorized = function isAuthorized(req, res) {
    let auth = module.exports.db.isTokenValid(module.exports.getToken(req));
    return auth.then((valid) => {
        if (!valid) {
            throw new module.exports.NotLoggedInError();
        } else {
            return valid;
        }
    }).catch((e) => {
        if  (e instanceof module.exports.NotLoggedInError) {
            res.status(401).json({"error": e.message})
        }
        throw e;
    });
}

module.exports.getToken = function getToken(req) {
    if ('query' in req && 'token' in req.query) {
        return req.query.token;
    }
    if ('cookies' in req && 'token' in req.cookies) {
        return req.cookies.token;
    }
}
