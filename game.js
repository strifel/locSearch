module.exports.getDistance = function getDistance(db, config, token) {
    let minDistance = config.getMinSingleDistance();
    return new Promise((resolve, reject) => {
        db.getDists(token).then(dists =>  {
            if (dists == null) reject({"error": config.getLang("notAllPositionSet")});
            let distance = 0;
            let correct = [];
            for (let dist in dists)  {
                if (!dists.hasOwnProperty(dist)) continue;
                if (dists[dist]['distance'] > minDistance) {
                    distance += dists[dist]['distance'];
                } else {
                    correct.push({id: dist, ...dists[dist]})
                }
            }
            resolve({"message": distance > config.getMaxDistance() ? config.getLang("finishWrongMessage").replace("{meters}", distance) : config.getLang("finishMessage").replace("{meters}", distance), "distance": distance, "correct": correct});
        });
    })
}
