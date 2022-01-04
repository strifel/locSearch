/**
 * Selects the next unset position.
 *
 * If there are none and checkSolution is enabled,
 * it will call selectFirstWrong.
 *
 * If there are none checkSolution is disabled,
 * it will open the check window (if callCheck is true)
 *
 * @param callCheck selects if the check window should be opened if none unset/none wrong
 */
function selectNext(callCheck) {
    for (let pos in this.positions) {
        // Continue if already set
        if (this.positions[pos]['lat'] || this.positions[pos]['long']) continue;
        setEdit(pos);
        return;
    }
    if (document.config.guided.checkSolution) selectFirstWrong(callCheck);
    else if (callCheck) window.open('/check', '_blank');
}

/**
 * This function checks a single position and if wrong shows
 * a modal and sets the position to edit.
 * @param pos id of the position
 */
function checkSingleSolution(pos) {
    let req = new XMLHttpRequest()
    req.onloadend = function () {
        let resp = JSON.parse(req.responseText);
        if (req.status === 428) {
            console.error("Checking single positions is disabled on server side.")
            return;
        }
        if (!resp.wrong) {
            console.error("The server does not send wrong positions");
            return;
        }
        for (let position in resp['wrong']) {
            position = resp['wrong'][position];
            if (position['id'] == pos) {
                $('#wrongModal').modal('show');
                setEdit(pos);
                return;
            }
        }
        // If not wrong (as otherwise returned). selectNext in reloadMarkers will not be called
        if (document.config.guided.enable) selectNext(document.config.guided.autoCallCheck);
    }
    req.open('POST', '/api/positions');
    req.send();
}

/**
 * This position checks if there are wrong positions
 * if there are any it will select the first one (smallest id)
 * and show the "guided-try-again" element for three seconds.
 *
 * If there arent any and callCheck is set to true it will
 * open the check page in a new tab.
 * This WILL also open the page if not all have been set, yet.
 * So this method should not be called, but be called by selectNext.
 *
 * @param callCheck if check should be opened, if there are not any wrong ones.
 */
function selectFirstWrong(callCheck) {
    let req = new XMLHttpRequest()
    req.onloadend = function () {
        let resp = JSON.parse(req.responseText);
        if (req.status === 428) {
            console.error("Checking single positions is disabled on server side.")
        }
        if (!resp.wrong) {
            console.error("The server does not send wrong positions");
        }
        let wrongs = resp['wrong'];
        if (wrongs.length === 0) {
            if (callCheck) window.open('/check', '_blank');
        } else {
            setEdit(wrongs[0]['id']);
            document.getElementById("guided-try-again").hidden = false;
            setTimeout(() => document.getElementById("guided-try-again").hidden = true, 3000)
        }
    }
    req.open('POST', '/api/positions');
    req.send();
}
