var editPosition;
var positions;

function reloadMarkers(positions) {
    for (var marker in document.markers) {
        if (document.markers.hasOwnProperty(marker)) {
            document.map.removeLayer(document.markers[marker]);
        }
    }
    document.markers = [];
    this.positions = [];
    positions.forEach((position) => {
        if (position['lat'] != null && position['long'] != null) {
            var marker = L.marker([position['lat'], position['long']], {draggable:'true'}).addTo(document.map);
            marker.bindPopup(position['name'] + "<br><a href='#' onclick='setEdit(" + position['id'] + ")'>" + document.lang.changePosition + "</a>");
            marker.on('dragstart', function (event) {
                editPosition = undefined;
            });
            marker.on('dragend', function(event){
                move(position['id'], marker.getLatLng());
            });
            document.markers.push(marker);
        }
        this.positions[position['id'].toString()] = position;
    })
}

function setEdit(position) {
    editPosition = position;
    L.DomUtil.addClass(document.map._container,'crosshair-cursor-enabled');
    if (document.config.showManualCoordinatesPrompt) {
        $('#coordModal').modal('show');
    }
    // Set quest view
    var positionData = positions[position];
    document.getElementById('quest-text').innerHTML = positionData['name'];
    if (positionData['image']) {
        document.getElementById('quest-image').src = '/image/' + positionData['image']
        document.getElementById('quest-image').style.display = 'inherit';
    } else {
        document.getElementById('quest-image').style.display = 'none';
    }
    document.getElementById('quest').style.display = 'inherit';
}

function resetEdit() {
    editPosition = undefined;
    document.getElementById('quest').style.display = 'none';
    L.DomUtil.removeClass(document.map._container,'crosshair-cursor-enabled');

}

function mapClick(e) {
    if (editPosition){
        move(editPosition, e.latlng);
    }
}


function move(pos, latlng) {
    var req = new XMLHttpRequest();
    req.onloadend = function () {
        var resp = JSON.parse(req.responseText);
        resetEdit();
        reloadMarkers(resp['positions'])
    }
    req.open('PUT', '/api/positions');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({'id': pos, 'lat': latlng.lat, 'long': latlng.lng}))
}
