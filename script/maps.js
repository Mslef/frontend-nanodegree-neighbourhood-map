var markers = []; // Containes all saved markers and addresses
var displayValues = [];
var infowindow = new google.maps.InfoWindow();
var marker;

// TODO: Add NYT, Wikipedia, Yahoo Weather and StreetView data to the content string
var contentString = "<div id='content'>"+
    "<div id='siteNotice'>"+
    "</div>"+
    "<h1 id='firstHeading' class='firstHeading'>Uluru</h1>"+
    "<button>Add to my list</button>"+
    "<div id='bodyContent'>"+
    "<p>Nyt</p>"+
    "<p>Wikipedia</p>"+
    "<p>Yahoo Weather</p>"+
    "<p>StreetView iframe</p>"+
    "</div>"+
    "</div>";

// Return a complete address from latlng address and marks it on the map
function codeLatLng() {
  var input = document.getElementById('latlng').value;
  var latlngStr = input.split(',', 2);
  var lat = parseFloat(latlngStr[0]);
  var lng = parseFloat(latlngStr[1]);
  var latlng = new google.maps.LatLng(lat, lng);
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        map.setZoom(11);
        marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
        infowindow.setContent(results[1].formatted_address);
        infowindow.open(map, marker);
      } else {
        alert('No results found');
      }
    } else {
      alert('Geocoder failed due to: ' + status);
    }
  });
}

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
