module.exports.getDistance = function getDistance(db, config, token) {
    return new Promise((resolve, reject) => {
        db.getDistance(token, config.getMinSingleDistance()).then(distance =>  {
            if (distance == null) {
                reject({"error": config.getLang("notAllPositionSet")});
            } else {
                resolve({"message": distance > config.getMaxDistance() ? config.getLang("finishWrongMessage").replace("{meters}", distance) : config.getLang("finishMessage"), "distance": distance});
            }
        });
    })
}
