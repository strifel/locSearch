module.exports.getDistance = function getDistance(db, config, token) {
    let minDistance = config.getMinSingleDistance();
    return new Promise((resolve, reject) => {
        db.getDists(token, config.getAllowCheckWhileNotAllSet()).then(dists =>  {
            if (dists == null) reject({"error": config.getLang("notAllPositionSet")});
            let distance = 0;
            let correct = [];
            let wrong = [];
            for (let dist in dists)  {
                if (!dists.hasOwnProperty(dist)) continue;
                if (dists[dist]['distance'] > minDistance) {
                    distance += dists[dist]['distance'];
                    wrong.push({id: dist, name: dists[dist]['name']})
                } else {
                    let data = {id: dist, ...dists[dist]};
                    if (!config.showCorrectDistances) delete data['distance'];
                    correct.push(data);
                }
            }
            resolve({
                "message": distance > config.getMaxDistance() ?
                    config.getLang("finishWrongMessage").replace("{meters}", distance) :
                    config.getLang("finishMessage").replace("{meters}", distance),
                "distance": config.getLang("finishWrongMessage").includes("{meters}") ? distance : 0,
                "correct": correct,
                "wrong": wrong
            });
        });
    })
}
