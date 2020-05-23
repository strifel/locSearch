var editPosition;

function reloadMarkers(positions) {
    for (var marker in document.markers) {
        if (document.markers.hasOwnProperty(marker)) {
            document.map.removeLayer(document.markers[marker]);
        }
    }
    document.markers = [];
    positions.forEach((position) => {
        if (position['lat'] != null && position['long'] != null) {
            var marker = L.marker([position['lat'], position['long']]).addTo(document.map);
            marker.bindPopup(position['name'] + "<br><a href='#' onclick='setEdit(" + position['id'] + ")'>" + document.lang.changePosition + "</a>");
            document.markers.push(marker);
        }
    })
}

function setEdit(position) {
    editPosition = position;
    L.DomUtil.addClass(document.map._container,'crosshair-cursor-enabled');
}

function mapClick(e) {
    if (editPosition){
        var req = new XMLHttpRequest();
        req.onloadend = function () {
            var resp = JSON.parse(req.responseText);
            editPosition = undefined;
            L.DomUtil.removeClass(document.map._container,'crosshair-cursor-enabled');
            reloadMarkers(resp['positions'])
        }
        req.open('PUT', '/api/positions');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify({'id': editPosition, 'lat': e.latlng.lat, 'long': e.latlng.lng}))
    }
}
