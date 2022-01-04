function reloadMarkers(positions) {
    for (let marker in document.markers) {
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
                this.editPosition = undefined;
            });
            marker.on('dragend', function(event){
                move(position['id'], marker.getLatLng());
            });
            document.markers.push(marker);
        }
        this.positions[position['id'].toString()] = position;
    })
    // If guided is enabled select next available quest (as long as checkSolution is not available, as it would
    // otherwise could switch forth and back)
    if (document.config.guided.enable && !document.config.guided.checkSolution) selectNext(document.config.guided.autoCallCheck);
}

function setEdit(position) {
    this.editPosition = position;
    L.DomUtil.addClass(document.map._container,'crosshair-cursor-enabled');
    if (document.config.showManualCoordinatesPrompt && (!document.config.guided.enable || document.config.guided.forceCoordinateWindow)) {
        $('#coordModal').modal('show');
    }
    // Set quest view
    let positionData = this.positions[position];
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
    this.editPosition = undefined;
    document.getElementById('quest').style.display = 'none';
    L.DomUtil.removeClass(document.map._container,'crosshair-cursor-enabled');
}

function mapClick(e) {
    if (editPosition){
        move(editPosition, e.latlng);
    }
}

function move(pos, latlng) {
    let req = new XMLHttpRequest();
    req.onloadend = function () {
        let resp = JSON.parse(req.responseText);
        resetEdit();
        reloadMarkers(resp['positions'])
        if (document.config.guided.checkSolution) {
            checkSingleSolution(pos);
        }
    }
    req.open('PUT', '/api/positions');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({'id': pos, 'lat': latlng.lat, 'long': latlng.lng}))
}
