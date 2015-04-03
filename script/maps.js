// Add a marker to the map and push to the array.
function addMarker(location) {
  var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

  var marker = new google.maps.Marker({
    position: location,
    map: map,
    title: 'test Title'
  });
  markers.push(marker);
  google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
}



// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
