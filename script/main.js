var markers = []; // Containes all saved markers and addresses
var displayValues = [];
var infowindow;
var marker;

// TODO: Add NYT, Wikipedia, Yahoo Weather and StreetView data to the content string
var contentString;


// Maps functions
/*
map.setZoom(11);


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

// Infowindow functions
infowindow.setContent(results[1].formatted_address);
infowindow.open(map, marker);

*/

// Add a marker to the map and push to the array.
function addMarker(location) {
  infowindow = new google.maps.InfoWindow({
        content: contentString
    });

  marker = new google.maps.Marker({
    position: location,
    map: map,
    title: 'test Title'
  });
  markers.push(marker);
  google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
}


var findInfo = function() {
    var entry = new AddressEntry();
    geocoder.geocode( { 'address': viewModel.address()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // Center the map
            map.setCenter(results[0].geometry.location);
            marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            // Set the contents of the info window
            contentString = "<div id='content'><div id='siteNotice'></div><h1 id='firstHeading' class='firstHeading'>"+results[0].formatted_address+"</h1><button data-bind='click: save'>Add to my list</button>"+"<div id='bodyContent'><p>Nyt</p><p>Wikipedia</p><p>Yahoo Weather</p><p>StreetView iframe</p></div></div>";

            infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow.open(map,marker);

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map,marker);
            });

            // Update the entry's info
            viewModel.greet(results[0].formatted_address);
            entry.address = results[0].formatted_address;
            entry.loc = results[0].geometry.location;
            entry.streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + results[0].geometry.location.k+', '+results[0].geometry.location.D;
            entry.nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + viewModel.address()+'&=sort=newest&api-key=773fe7f4f46bee0b96f79fa100da469a:11:71760315';

            // TODO: Show info Window with NYT, Wiki, Yahoo, Street View data
            // Add to the beginning of the search history array
            viewModel.searchHistory.unshift(entry);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
};


// Class for Address entries
var AddressEntry = function() {
    // Save to the Address List
    this.save = function() {
        addressLength = viewModel.addressList().length;
        for (var i = 0; i < addressLength; i++)  {
            savedAddress = viewModel.addressList()[i].address;
            console.log(savedAddress === this.address);
            if (savedAddress === this.address){
                // Show a warning for 0.5 seconds
                viewModel.showWarning(true);
                setTimeout(function(){
                    viewModel.showWarning(false);
                }, 500);

                return;
            }
        }
        // Add to beginning of the list
        viewModel.addressList.unshift(this);
        addMarker(this.address);
    };

    // Remove this entry from addressList
    this.remove = function() {
        viewModel.addressList.remove(this);
    };

    // Show this location on the map
    this.update = function() {
        console.log(this.loc);
        map.setCenter(this.loc);
        //infowindow.setContent(this.address);
        //infowindow.open(map, marker);

    };

};

var viewModel = {
    address: ko.observable(""),
    searchHistory: ko.observableArray(),
    mapsURL:ko.observable("https://maps.googleapis.com/maps/api/streetview?size=600x400&location=40.689556,-74.043539"),
    greeting: ko.observable("Where would you want to live?"),
    nytHeader: ko.observable("New York Times Articles"),
    wikiHeader: ko.observable("Relevant Wikipedia Links"),
    nytArticles: ko.observable("What's going on in your new city? Enter an address and hit submit and the NY Times will tell you here!"),
    nytArticleList: ko.observableArray(),
    wikiArticleList: ko.observableArray(),
    showDefault: ko.observable(true),
    addressList: ko.observableArray(),
    showAddButton: ko.observable(false),
    showWarning: ko.observable(false)
};

viewModel.clearHistory = function() {
    viewModel.searchHistory([]);
};

viewModel.greet = function(address) {
    viewModel.greeting('So, you want to live at ' + address + '?');
};

// Update the view
viewModel.loadData = function() {
    // Push the data to the search history
    findInfo();

    // Hide the default text
    viewModel.showDefault(false);

    // Show the button to add addresses
    viewModel.showAddButton(true);



    /*
    // Update NYT header
    viewModel.nytHeader('New York Times articles about ' + viewModel.address());
    // Update Wiki header
    viewModel.wikiHeader('Wikipedia articles about ' + viewModel.address());

    // Get NYT links
    $.getJSON(viewModel.nytURL(), function(data) {
        //Loop through all articles
        var docLength = data.response.docs.length;
        for (var i = 0; i < docLength; i++) {
            var dataEntry = {};
            dataEntry.URL = data.response.docs[i].web_url;
            dataEntry.mainHeadline = data.response.docs[i].headline.main;
            dataEntry.snippet = data.response.docs[i].snippet;
            viewModel.nytArticleList.push(dataEntry);
        }
    });
    // TODO: Get Wikipedia articles
    */
};

// TODO: implement a visible locations container, to sort and search through;

ko.applyBindings(viewModel);
