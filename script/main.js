var marker;
var geocoder = new google.maps.Geocoder();
var infowindow = new google.maps.InfoWindow();

// Following variables are for the info windows
var title = "<div id='content'><div id='siteNotice'></div><h1 id='firstHeading' class='firstHeading'>%address%</h1><div id='bodyContent'>";
var nyt = "<h5 id='nyt'>New York Times articles: <button id='nyt-button' onclick='showNYT()'>Show</button></h5>";
var wiki = "<p>Wikipedia articles: %wikipedia%</p>";
var weather = "<p>Yahoo weather: %weather%</p>";
var streetView = "<iframe width='95%' src='%streetview%'></iframe>";
var footer = "</div></div>";

// TODO: Add Wikipedia, Yahoo Weather and StreetView data to the content string

// Append NYT data to info window
var showNYT= function () {
    if ($('#nyt-button').text() === "Show"){
        $('#nyt-button').html("Hide");
        $('#nyt').append($('#nytimes-articles').clone());
        $('#nyt #nytimes-articles').css("display", "block");
    }
    else {
        $('#nyt-button').html("Show");
        $('#nyt #nytimes-articles').css("display", "none");
    }
};

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
    var contentString = title.replace("%address%", address) + nyt.replace("%nyt%", nytURL) + wiki.replace("%wikipedia%", wikiURL) + weather.replace("%weather%", weatherURL) + streetView.replace("%streetview%", streetViewURL) + footer;
    return contentString;
};

// Class for Address entries
var AddressEntry = function() {
    // Save to the Address List
    this.save = function() {
        // Check if entry already added
        if($.inArray(this, viewModel.addressList())!==-1){
            viewModel.showWarning(true);
            setTimeout(function(){
                viewModel.showWarning(false);
            }, 500);
            return;
        }

        // Add to beginning of the list
        viewModel.addressList.unshift(this);
        viewModel.visibleAddress.unshift(this);
        marker = new google.maps.Marker({
          position: this.loc,
          map: map,
        });
    };

    // Remove entry from addressList
    this.remove = function() {
        viewModel.addressList.remove(this);
        viewModel.visibleAddress.remove(this);
    };

    // Show location on the map
    this.update = function() {
        viewModel.address(this.address);
        viewModel.findInfo();
    };

    // Hide entry
    this.hide = function() {
        viewModel.visibleAddress.remove(this);
    };
};

// Helper function to clear the map of unsaved markers
function setAllMap(map) {
  for (var i = 0; i < viewModel.markers().length; i++) {
      viewModel.markers()[i].setMap(map);
  }
}

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
    var entry = new AddressEntry();
    geocoder.geocode( { 'address': viewModel.address()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            // Hide all markers except saved ones
            setAllMap(null);

            // Center the map and add a marker
            map.setCenter(results[0].geometry.location);
            marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            viewModel.markers.push(marker);

            // Update the entry's info
            viewModel.greet(results[0].formatted_address);
            entry.address = results[0].formatted_address;
            entry.loc = results[0].geometry.location;
            entry.streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + results[0].geometry.location.k+', '+results[0].geometry.location.D;
            entry.nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + entry.address+'&=sort=newest&api-key=773fe7f4f46bee0b96f79fa100da469a:11:71760315';

            // Load data
            findNYTLinks(entry.nytURL);

            // Close open info widow
            if (infowindow) infowindow.close();

            // Set the contents of the info window
            infowindow.setContent(createContent(entry.address, entry.nytURL, "Wiki", "Weather", entry.streetViewURL));
            infowindow.open(map,marker);

            // Open the info window if the marker is clicked
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(createContent(entry.address, entry.nytURL, "Wiki", "Weather", entry.streetViewURL));
                infowindow.open(map,marker);
            });

            // Add to the beginning of the search history array
            viewModel.searchHistory.unshift(entry);

        } else {
            // Error handling for geocode
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
};

// TODO: implement a visible locations container, to sort and search through;

ko.applyBindings(viewModel);
