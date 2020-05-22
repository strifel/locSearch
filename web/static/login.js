function registerToken() {
    var req = new XMLHttpRequest();
    req.onloadend = function () {
        document.getElementById('newTokenBox').hidden = false;
        var token = JSON.parse(req.responseText)['token'];
        setTokenCookie(token);
        document.getElementById('newToken').value = token;
    }
    req.open("POST", "/api/register/token");
    req.send();
}

function enteredToken() {
    var token = document.getElementById('oldToken').value;
    var req = new XMLHttpRequest();
    req.onloadend = function () {
        if (req.status === 200) {
            setTokenCookie(token);
            location.reload();
        } else {
            document.getElementById('oldToken').style.color = "red";
        }
    }
    req.open("GET", "/api/checkAuthorization?token=" + token);
    req.send();
}

function setTokenCookie(token) {
    var cookieExpire = new Date();
    cookieExpire.setMonth( cookieExpire.getMonth() + 3 );
    document.cookie = 'token=' + token + '; expires=' + cookieExpire.toUTCString();
}
