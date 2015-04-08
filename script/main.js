// global variables
var marker;
var clickedMarker;
var panorama;

var geocoder = new google.maps.Geocoder();
var sv = new google.maps.StreetViewService();
var bounds = new google.maps.LatLngBounds();

// Following code for the infowindows and Street View data is adapted from geocodezip's code on
// http://stackoverflow.com/questions/28227255/google-maps-adding-streetview-to-each-infowindow

// Create the shared infowindow with three DIV placeholders
// One for a text string, one for the nyt articles, one for the StreetView panorama.
var content = document.createElement("DIV");
var title = document.createElement("DIV");
content.appendChild(title);
var streetview = document.createElement("DIV");
streetview.style.width = "250px";
streetview.style.height = "250px";
content.appendChild(streetview);
var htmlContent = document.createElement("DIV");
htmlContent.innerHTML = "<h5 id='nyt'>New York Times articles: <button id='nyt-button' onclick='showNYT()'>Show</button></h5>";
// TODO: Add Wiki and Yahoo Weather data and methods in this string
content.appendChild(htmlContent);

var infowindow = new google.maps.InfoWindow({
  content: content
});



// Create the marker and set up the event window function
function createMarker(latlng, name) {
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: name,
    });

    google.maps.event.addListener(marker, "click", function() {
        // TODO: Find entry to use :
        //entry.update()
        clickedMarker = marker;
        sv.getPanoramaByLocation(marker.getPosition(), 50, processSVData);
        openInfoWindow(marker);
    });

    return marker;
}

// Load Street View data
function processSVData(data, status) {
  if (status == google.maps.StreetViewStatus.OK) {
    var marker = clickedMarker;
    openInfoWindow(clickedMarker);

    if (!!panorama && !!panorama.setPano) {

      panorama.setPano(data.location.pano);
      panorama.setPov({
        heading: 270,
        pitch: 0,
        zoom: 1
      });
      panorama.setVisible(true);

      google.maps.event.addListener(marker, 'click', function() {

        var markerPanoID = data.location.pano;
        // Set the Pano to use the passed panoID
        panorama.setPano(markerPanoID);
        panorama.setPov({
          heading: 270,
          pitch: 0,
          zoom: 1
        });
        panorama.setVisible(true);
      });
    }
  } else {
    openInfoWindow(clickedMarker);
    title.innerHTML = clickedMarker.getTitle() + "<br>Street View data not found for this location";
    panorama.setVisible(false);
  }
}

// Handle the DOM ready event to create the StreetView panorama
// as it can only be created once the DIV inside the infowindow is loaded in the DOM.
var pin = new google.maps.MVCObject();
google.maps.event.addListenerOnce(infowindow, "domready", function() {
  panorama = new google.maps.StreetViewPanorama(streetview, {
    navigationControl: false,
    enableCloseButton: false,
    addressControl: false,
    linksControl: false,
    visible: true
  });
  panorama.bindTo("position", pin);
});

// Set the infowindow content and display it on marker click.
// Use a 'pin' MVCObject as the order of the domready and marker click events is not garanteed.
function openInfoWindow(marker) {
    title.innerHTML = marker.getTitle();
    pin.set("position", marker.getPosition());
    infowindow.open(map, marker);
  }

// Append NYT data to info window
var showNYT= function () {
    if ($('#nyt-button').text() === "Show"){
        $('#nyt-button').html("Hide");
        // If no articles were appended to the infowindow, append them
        if ($('#nyt #nytimes-articles').length === 0) {
            $('#nyt').append($('#nytimes-articles').clone());
        } else {
            //If articles were already added, display them
            $('#nyt #nytimes-articles').css("display", "block");

        }
    }
    else {
        $('#nyt-button').html("Show");
        $('#nyt #nytimes-articles').css("display", "none");
    }
};

// Get NYT links and load them asynchronously on the page
var findNYTLinks = function(nytURL) {
  $.getJSON(nytURL, function(data) {
      // Clear previously saved articles
      viewModel.nytArticleList([]);
      //Loop through the 5 first articles
      var docLength = data.response.docs.length;
      if (docLength === 0) {
        $('#nytimes-articles').html("No New York Times articles about this location, sorry!");
        return;
      }
      var maxIteration = Math.min(docLength, 5);
      for (var i = 0; i < maxIteration; i++) {
        var dataEntry = {};
        dataEntry.URL = data.response.docs[i].web_url;
        dataEntry.mainHeadline = data.response.docs[i].headline.main;
        dataEntry.snippet = data.response.docs[i].snippet;
        viewModel.nytArticleList.push(dataEntry);
      }
  }).error(function() {
        $('#nytimes-articles').html("Error loading New York Times articles, sorry!");
  });
};

/*
// TODO: Get Wikipedia articles
var findWikiLinks = function(wikiURL) {
  return;
};

// TODO: Get Yahoo data
var findWeather = function(weatherURL) {
  return;
};
*/

// Class for Address entries
var AddressEntry = function(marker, city) {
    // Marker associated with the entry
    this.marker = marker;

    this.city = city;

    // Address and localisation
    this.address = marker.getTitle();
    this.loc = marker.internalPosition;

    // Save to the Address List
    this.save = function() {
        // Check if entry already added
        if($.inArray(this, viewModel.addressList())!==-1){
            // Warn the user that entry already added
            viewModel.showWarning(true);
            setTimeout(function(){
                viewModel.showWarning(false);
            }, 500);
            return;
        }
        // Add to beginning of the list
        viewModel.addressList.unshift(this);
        viewModel.visibleAddress.unshift(this);
    };

    // Remove entry from addressList
    this.remove = function() {
        viewModel.addressList.remove(this);
        viewModel.visibleAddress.remove(this);
    };

    // Show location on the map
    this.update = function() {
        map.setCenter(this.marker.internalPosition);
        viewModel.greet(this.address);

        // Load NYT data
        nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + this.address+'&=sort=newest&api-key=773fe7f4f46bee0b96f79fa100da469a:11:71760315';
        findNYTLinks(nytURL);
        console.log(nytURL);
        // Close open info widow and open the marker's
        infowindow.close();
        openInfoWindow(marker);
    };

    // Hide entry
    this.hide = function() {
      viewModel.visibleAddress.remove(this);
    };
};

// View Model and bindings
var viewModel = {
    address: ko.observable(""), // Address in the view's search bar
    searchHistory: ko.observableArray(), // Search history
    searchValue: ko.observable(""), // Value to filter addresses
    markers: ko.observableArray(), // Containes all saved markers and addresses
    greeting: ko.observable("Where would you want to live?"),
    nytArticleList: ko.observableArray(), // List of 5 NYT articles
    wikiArticleList: ko.observableArray(), // List of Wiki articles
    addressList: ko.observableArray(), // All addresses
    visibleAddress: ko.observableArray(), // Visible addresses
    showWarning: ko.observable(false) // Show warning if entry already saved
};

// Clear the search history
viewModel.clearHistory = function() {
    viewModel.searchHistory([]);
};

// Update the greeting to reflect searched address
viewModel.greet = function(address) {
    viewModel.greeting('So, you want to live at ' + address + '?');
};

// Find all info for an AddressEntry Object, add it to the search history and update the view
viewModel.findInfo = function() {
    geocoder.geocode( { 'address': viewModel.address()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // Hide all markers except saved ones
            var latlng = results[0].geometry.location;
            var address = results[0].formatted_address;

            // Create an entry with a marker
            var entry = new AddressEntry(createMarker(latlng, address));

            // Update the greeting's info
            viewModel.greet(address);

            // Add to the beginning of the search history array
            // TODO: Make sure entry not already in searchHistory
            if($.inArray(entry, viewModel.searchHistory()) ===-1) {
                viewModel.searchHistory.remove(entry);
            } viewModel.searchHistory.unshift(entry);

            // Update the map to show the marker's info
            entry.update();

        } else {
            // Error handling for geocode
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
};
/*
Following code to show markers on the map an object array
// Read the data from markers json object
for (var i = 0; i < markers.length; i++) {
  // obtain the attribues of each marker
  var lat = parseFloat(markers[i].lat);
  var lng = parseFloat(markers[i].lng);
  var point = new google.maps.LatLng(lat, lng);
  var html = markers[i].html;
  var label = markers[i].label;
  // create the marker
  var marker = createMarker(point, label, html);
  bounds.extend(point);
}

// Zoom and center the map to fit the markers
map.fitBounds(bounds);
*/
// TODO: implement a visible locations container, to sort and search through;

ko.applyBindings(viewModel);
