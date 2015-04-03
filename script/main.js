// Class for Address entries
var AddressEntry = function() {
    this.street = viewModel.street();
    this.city = viewModel.city();
    this.address = viewModel.address();
    this.remove = function() {
        viewModel.addressList.remove(this);
    };
    this.update = function() {
        viewModel.street(this.street);
        viewModel.city(this.city);
        viewModel.loadData();
    };
        
};


var viewModel = {
    street: ko.observable(""),
    city: ko.observable(""),
    address: ko.observable(""),
    mapsURL: ko.observable("https://maps.googleapis.com/maps/api/streetview?size=600x400&location=40.689556,-74.043539"),
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
viewModel.nytURL = ko.computed(function() {
    return 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + viewModel.address()+'&=sort=newest&api-key=773fe7f4f46bee0b96f79fa100da469a:11:71760315';
}, viewModel);
        

viewModel.addToAddressList = function() {
    var entry = new AddressEntry();
    //TODO: Add pin on map method

    // Check if entry already in
    addressLength = viewModel.addressList().length;
    for (var i = 0; i < addressLength; i++)  {
        savedAddress = viewModel.addressList()[i].address;
        console.log(savedAddress === viewModel.address());
        if (savedAddress === viewModel.address()){
            viewModel.showWarning(true);
            console.log(savedAddress === viewModel.address());
            return;
        }
    }
    console.log(entry);
    //Add the current address to addressList
    viewModel.showWarning(false);
    viewModel.addressList.push(entry);
    // Add marker on the map
    addMarker(entry.address);

};

// Update the view
viewModel.loadData = function() {

    var geocoder = new google.maps.Geocoder();
    viewModel.address(viewModel.street() + ', ' + viewModel.city());
    geocoder.geocode( { 'address': viewModel.address()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

    viewModel.address(viewModel.street() + ', ' + viewModel.city());

    //Update the greeting
    viewModel.greeting('So, you want to live at ' + viewModel.address() + '?');
    // Update NYT header
    viewModel.nytHeader('New York Times articles about ' + viewModel.address());
    // Update Wiki header
    viewModel.wikiHeader('Wikipedia articles about ' + viewModel.address());

    //Update the background image
    viewModel.mapsURL('https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + viewModel.address());

    // Hide the default text
    viewModel.showDefault(false);

    // Show the button to add addresses
    viewModel.showAddButton(true);

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
};

// TODO: Search bar functionality

// TODO: Sort order


viewModel.loadListData = function() {

    viewModel.loadData();
};

ko.applyBindings(viewModel);

// TODO: Grunt minification



