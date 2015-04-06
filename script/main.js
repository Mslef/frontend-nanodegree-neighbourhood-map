
// Class for Address entries
var AddressEntry = function() {
    // Find the coordinates of the location, if successfull add Street View URL and location
    this.nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + viewModel.address()+'&=sort=newest&api-key=773fe7f4f46bee0b96f79fa100da469a:11:71760315';

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': viewModel.address()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            this.location = results[0].geometry.location;
            this.streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + results[0].geometry.location;

            // Return complete address of the location from the coordinates
            geocoder.geocode({'latLng': results[0].geometry.location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                this.address = results[1].formatted_address;
              } else {
                alert('No results found');
              }
            } else {
              alert('Geocoder failed due to: ' + status);
            }
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

    // Remove this entry from addressList
    this.remove = function() {
        viewModel.addressList.remove(this);
    };

    // Show this location on the map
    this.update = function() {
        map.setCenter(this.location);
    };

};

// Maps functions
/*
map.setZoom(11);

map.setCenter(results[0].geometry.location);
var marker = new google.maps.Marker({
map: map,
position: results[0].geometry.location
});

// Infowindow functions
infowindow.setContent(results[1].formatted_address);
infowindow.open(map, marker);
*/

var viewModel = {
    address: ko.observable(""),
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


// NYT URL



viewModel.addToAddressList = function() {
    var entry = new AddressEntry();
    console.log(entry);
    //TODO: Add pin on map method

    // Check if entry already in
    addressLength = viewModel.addressList().length;
    for (var i = 0; i < addressLength; i++)  {
        savedAddress = viewModel.addressList()[i].address;
        console.log(savedAddress === entry.address());
        if (savedAddress === entry.address()){
            viewModel.showWarning(true);
            return;
        }
    }
    //Add the current address to addressList
    viewModel.showWarning(false);
    viewModel.addressList.push(entry);
    // Add marker on the map
    addMarker(entry.address);

};

// Update the view
viewModel.loadData = function() {
    var entry = new AddressEntry();
    //Update the greeting
    viewModel.greeting('So, you want to live at ' + viewModel.address() + '?');

    /*
    // Update NYT header
    viewModel.nytHeader('New York Times articles about ' + viewModel.address());
    // Update Wiki header
    viewModel.wikiHeader('Wikipedia articles about ' + viewModel.address());
    */

    // Center the map around the new Address
    map.setCenter(entry.location);

    // Hide the default text
    viewModel.showDefault(false);

    // Show the button to add addresses
    viewModel.showAddButton(true);

    /*
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
    }

    // TODO: Get Wikipedia articles


    );
    */
};

// TODO: implement a visible locations container, to sort and search trough;


ko.applyBindings(viewModel);

// TODO: Grunt minification, uncss
