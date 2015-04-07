var markers = []; // Containes all saved markers and addresses
var displayValues = [];
var infowindow;
var marker;

// Following variables are for the info windows
var title = "<div id='content'><div id='siteNotice'></div><h1 id='firstHeading' class='firstHeading'>%address%</h1><div id='bodyContent'>";
var nyt = "<h5 id='nyt'>New York Times articles: <button id='nyt-button' onclick='showNYT()'>Show</button></h5>";
var wiki = "<p>Wikipedia articles: %wikipedia%</p>";
var weather = "<p>Yahoo weather: %weather%</p>";
var streetView = "<iframe width='95%' > src='%streetview%'></iframe>";
var footer = "</div></div>";

// TODO: Add NYT, Wikipedia, Yahoo Weather and StreetView data to the content string


// Maps functions
/*
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

*/

// Append NYT data to info window
var showNYT= function () {
    if ($('#nyt-button').text() === "Show"){
        $('#nyt-button').html("Hide");
        $('#nyt').append($('#nytimes-articles'));
        $('#nyt #nytimes-articles').css("display", "block");
    }
    else {
        $('#nyt-button').html("Show");
        $('#nyt #nytimes-articles').css("display", "none");
    }
};

// Add a marker to the map and push to the array.
function addMarker(location) {

  marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  markers.push(marker);

}

// Get NYT links
var findNYTLinks = function(nytURL) {
    $.getJSON(nytURL, function(data) {
        //Loop through the 5 first articles
        var docLength = data.response.docs.length;
        var maxIteration = Math.min(docLength, 5);
        // Clear previously saved articles
        viewModel.nytArticleList([]);
        for (var i = 0; i < maxIteration; i++) {
            var dataEntry = {};
            dataEntry.URL = data.response.docs[i].web_url;
            dataEntry.mainHeadline = data.response.docs[i].headline.main;
            dataEntry.snippet = data.response.docs[i].snippet;
            viewModel.nytArticleList.push(dataEntry);
        }
    });
};

// TODO: Get Wikipedia articles
var findWikiLinks = function(wikiURL) {
    return;
};

// TODO: Get Yahoo data
var findWeather = function(weatherURL) {
    return;
};

var createContent = function (address, nytURL, wikiURL, weatherURL, streetViewURL) {
    findNYTLinks(nytURL);
    var contentString = title.replace("%address%", address) + nyt.replace("%nyt%", nytURL) + wiki.replace("%wikipedia%", wikiURL) + weather.replace("%weather%", weatherURL) + streetView.replace("%streetview%", streetViewURL) + footer;
    return contentString;
};


// Function that finds all the info for an AddressEntry Object and adds it to the search history
var findInfo = function() {
    var entry = new AddressEntry();
    geocoder.geocode( { 'address': viewModel.address()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // Center the map and add a marker
            map.setCenter(results[0].geometry.location);
            marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            // Update the entry's info
            viewModel.greet(results[0].formatted_address);
            entry.address = results[0].formatted_address;
            entry.loc = results[0].geometry.location;
            entry.streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&output=embed&location=' + results[0].geometry.location.k+', '+results[0].geometry.location.D;
            entry.nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + entry.address+'&=sort=newest&api-key=773fe7f4f46bee0b96f79fa100da469a:11:71760315';

            // Close open info widow
            if (infowindow) infowindow.close();

            // Set the contents of the info window
            infowindow = new google.maps.InfoWindow({
                content: createContent(entry.address, entry.nytURL, "Wiki", "Weather", entry.streetViewURL)
            });
            infowindow.open(map,marker);

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map,marker);
            });



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
        marker = new google.maps.Marker({
          position: this.loc,
          map: map,
        });
        map.setCenter(this.loc);

        // Close any open infowindow and open the item's
        if (infowindow) infowindow.close();
        infowindow.open(map,marker);
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

};

// TODO: implement a visible locations container, to sort and search through;

ko.applyBindings(viewModel);
