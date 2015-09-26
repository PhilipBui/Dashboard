var geocoder = new google.maps.Geocoder();
function geocodeAddress(address) {
	geocoder.geocode({'address' : address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			return [results[0].geometry.location.lat, results[0].geometry.location.lng];
		}
		else {
			alert('Could not find address' + status);
		}
	});
}