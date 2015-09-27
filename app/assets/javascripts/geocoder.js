var geocoder = new google.maps.Geocoder();
function geocodeAddress(address) {
	geocoder.geocode({'address' : address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			return results[0].geometry.location;
		}
		else {
			alert('Could not find address' + status);
		}
	});
}
function createMarker(location) {
	var marker = new google.maps.Marker({
		position: location
	});
	return marker;
}
function createMarker(description, location) {
	var marker = new google.maps.Marker({
		title: description,
		position: location
	});
	return marker;
}