var app = angular.module('Dashboard', ['ngMap', 'chart.js']);

// Controller that controls creation and deletion of widgets AKA directives
app.controller('DashboardController', ['$scope', '$compile', dashboardController]); 
function dashboardController($scope, $compile) {
	$scope.addEmployeesLocation = function() {
		var childScope = $scope.$new();
		var compiledDirective = $compile('<employees-location/>');
		var directiveElement = compiledDirective(childScope);
		$('.container').append(directiveElement);
	};
	$scope.addSalesFlow = function() {
		var childScope = $scope.$new();
		var compiledDirective = $compile('<sales-flow/>');
		var directiveElement = compiledDirective(childScope);
		$('.container').append(directiveElement);
	}
	// $scope.showEmployeesLocationTab = false;
	// $scope.showsalesFlowTab = false;
}

// Employees location widget with its respective controller
app.directive('employeesLocation', employeesLocation);
function employeesLocation() {
	var directive = {
		restrict: 'E',
		templateUrl: 'templates/employeesLocation.html',
		controller: employeesLocationController
	};
	return directive;
}
app.directive('salesFlow', salesFlow);
function salesFlow() {
	var directive = {
		restrict: 'E',
		templateUrl: 'templates/salesFlow.html',
		controller: salesFlowController
	};
	return directive;
}
// Each panel will have a different controller to control different content.
app.controller('employeesLocationController', ['$scope', '$element', '$http', '$q', employeesLocationController]);
function employeesLocationController($scope, $element, $http, $q) {	
	$scope.dataLoaded = false; // Is panel content loaded, used to load content when finished otherwise show loading icon
	var employeesLocation = {}; // Employees location {address, how many employees} 
	$scope.panelContent = 'templates/lineChart.html'; // Chooses what content inside panel, {map, line, bar, pie, area}
	$scope.chart = {
		data: [[]], 
		labels: [],
		series: []
	};
	var markers = []; // Google Map Markers
	$scope.totalEmployees = 0; // Total employees found
	$scope.getContent = function(resource) {
		$scope.dataLoaded = false
		$http.get(resource).then(function(result) { // Waits for $http.get to finish then call function
			loadContent(result.data);
		});
	}
	loadContent = function(employeeDetails) {
		$scope.totalEmployees = 0;
		employeesLocation = {}; // We combine same addresses and calculate how many employees in each one, since geocoding is an expensive task
		for (var i = 0; i < employeeDetails.content.employees.length; i++) {
			var address = employeeDetails.content.employees[i].address;
			var splitAddress = address.split(', ');
			var state = splitAddress[splitAddress.length-2].replace(/[0-9]/g, '');
			var country = splitAddress[splitAddress.length-1];
			var newAddress = state + ', ' + country;
			employeesLocation[newAddress] = (employeesLocation[newAddress] || 0) + 1;
			$scope.totalEmployees+= 1;
		}
		var promises = []; // To implement faster data loading, we use $q promises to do asynchronous data loading
		angular.forEach(employeesLocation, function(employeesAmount, address) { 
			var markerData = {};
			markerData[address] = employeesAmount;
			var loadMarkerPromise = loadMarkers(markerData); // Returns a $q.deferredTask.promise
			promises.push(loadMarkerPromise); // We put each geocoding request into a seperate promise
		})
		var loadChartPromise = loadChart('Employees Location', employeesLocation); // Returns a $q.deferredTask.promise
		promises.push(loadChartPromise); // We put load chart request as another promise
		$q.all(promises).then(function(){ // We execute all the promises asynchronously
			$scope.dataLoaded = true;
		})
	}
	loadMarkers = function(markerData) { // markerData must be in the form of {[address => employeesAmount, data]}
		var deferred = $q.defer();
		markers = [];
		for (var address in markerData) {
			var employeesAmount = markerData[address];
			geocoder.geocode({'address' : address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var googlesAddress = results[0].formatted_address;
					var result = results[0].geometry.location;
					var marker = createMarker(googlesAddress + ' has ' + employeesAmount + ' employees!', result);
					markers.push(marker);
				}
				else {
					console.log('Could not find address' + address + ' : ' + status); // Should delete 
				}
			});
		}
		deferred.resolve();
		return deferred.promise;
	}
	loadChart = function(description, chartData) { // chartData must be in the form of {[label, data]}
		var deferred = $q.defer();
		$scope.chart.data = [[]];
		$scope.chart.labels = [];
		$scope.chart.series = [];
		for (var address in chartData) {
			var employeesAmount = chartData[address];
			$scope.chart.data[0].push(employeesAmount);
			$scope.chart.labels.push(address);
		}
		$scope.chart.series.push(description);
		$scope.chart.data[0].push(0);
		deferred.resolve();
		return deferred.promise;
	}
	renderMarkers = function(map) {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	}
	$scope.changeChart = function(chartType) {
		$scope.panelContent = 'templates/' + chartType + '.html';
	}
	$scope.destroy = function() {
		$element.remove();
	}
	// Event listener whenenver map is loaded, ngmaps broadcasts mapInitialized when initaliazed 
	$scope.$on('mapInitialized', function (event, map) {
		renderMarkers(map);
	})
	$scope.getContent('employeeDetails.json');
}
// Each panel will have a different controller hence different content. Sales Flow request different content hence different controller.
app.controller('salesFlowController', ['$scope', '$element', '$http', '$q', salesFlowController]);
function salesFlowController($scope, $element, $http, $q) {
	$scope.dataLoaded = false; // Is panel content loaded, used to load content when finished otherwise show loading icon
	$scope.panelContent = 'templates/lineChart.html'; // Chooses what content inside panel, {map, line, bar, pie, area}
	$scope.chart = {
		data: [[], []], 
		labels: [],
		series: []
	};
	var markers = []; // Google Map Markers
	$scope.totalSales = 0; // Total sales found
	$scope.totalInvoices = 0; // Total invoices found (including due)
	var invoicesDue = {}; // Total sales for each address
	var invoicesPaid = {}; // Total invoices for each address
	$scope.getContent = function(resource) {
		$scope.dataLoaded = false
		$http.get(resource).then(function(result) { // Waits for $http.get to finish then call function
			loadContent(result.data);
		});
	}
	loadContent = function(invoicesList) {
		invoicesPaid = {}; // We combine same addresses and calculate how much invoices paid in each one, since geocoding is an expensive task
		invoicesDue = {}; // We combine same addresses and calculate how much invoices due in each one, since geocoding is an expensive task
		$scope.totalSales = 0; // We don't use the JSON's totalInvoices since we only want to map invoice data that has addresses associated with them
		$scope.totalInvoices = 0;
		for (var i = 0; i < invoicesList.content.entities.length; i++) {
			var locality = invoicesList.content.entities[i].address.l;
			var region = invoicesList.content.entities[i].address.r;
			var country = invoicesList.content.entities[i].c;
			var newAddress = '';
			if (locality != null) {
				newAddress += locality;
			}
			if (region != null) {
				newAddress += ' ' + region;
			}
			if (country != null) {
				newAddress += ' ' + country
				alert(country);
			}
			newAddress = newAddress.replace(/-/g, '');
			var trimmedAddress = newAddress.replace(/^\s+$/, ''); // Address validation, don't map data without addresses
			if (trimmedAddress != '') {
				var totalPaid = invoicesList.content.entities[i].total_paid;
				var totalDue = invoicesList.content.entities[i].total_due;
				if (totalPaid == null) {
					totalPaid = 0;
				}
				if (totalDue == null) {
					totalDue = 0;
				}
				invoicesPaid[newAddress] = (invoicesPaid[newAddress] || 0) + totalPaid;
				invoicesDue[newAddress] = (invoicesDue[newAddress] || 0) + totalDue;
				$scope.totalSales += totalPaid;
				$scope.totalInvoices += totalPaid + totalDue; // Tossup between accessing JSON content + validation or adding
			}
		}
		var promises = []; // To implement faster data loading, we use $q promises to do asynchronous data loading
		angular.forEach(invoicesPaid, function(invoicesPaid, address) {  // Use either data, both map same addresses anyways
			var invoicesPaidData = {};
			invoicesPaidData[address] = invoicesPaid;
			var invoicesDueData = {};
			invoicesDueData[address] = invoicesDue[address];
			var loadMarkerPromise = loadMarkers(invoicesPaidData, invoicesDueData);
			promises.push(loadMarkerPromise); // We put each geocoding request into a seperate promise
		})
		// We don't use load chart promise here, since we want to clean the addresses when queried into Google with Google's full addresses.
		$q.all(promises).then(loadChart("Invoices Paid", invoicesPaid, "Invoices Due", invoicesDue)).then(function() { // We execute all the promises asynchronously
			$scope.dataLoaded = true;
		})
	}
	loadMarkers = function(markerData, markerData2) { // markerData must be in the form of {[label, data]}
		var deferred = $q.defer();
		markers = [];
		for (var address in markerData) {
			var invoicesPaidAmount = markerData[address];
			var invoicesDueAmount = markerData2[address];
			geocoder.geocode({'address' : address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var googlesAddress = results[0].formatted_address;
					var result = results[0].geometry.location;
					var marker = createMarker(googlesAddress + ' has $' + invoicesPaidAmount + ' sales flow with expected $' + invoicesDueAmount + '!', result);
					markers.push(marker);
					delete invoicesPaid[address]; // Cleaning invoices paid address with Google's address
					invoicesPaid[googlesAddress] = (invoicesPaid[googlesAddress] || 0) + invoicesPaidAmount;
					delete invoicesDue[address]; // Cleaning invoices due address with Google's address
					invoicesDue[googlesAddress] = (invoicesDue[googlesAddress] || 0) + invoicesDueAmount;
				}
				else {
					console.log('Could not find address' + address + ' : ' + status);
				}
			});
		}
		deferred.resolve();
		return deferred.promise;
	}
	loadChart = function(description, chartData, description2, chartData2) { // chartData must be in the form of {[label, data]}
		var deferred = $q.defer();
		$scope.chart.data = [[], []];
		$scope.chart.labels = [];
		$scope.chart.series = [];
		for (var address in chartData) {
			var invoicesPaidAmount = chartData[address];
			var invoicesDueAmount = chartData2[address]
			$scope.chart.data[0].push(invoicesPaidAmount);
			$scope.chart.data[1].push(invoicesDueAmount);
			$scope.chart.labels.push(address);
		}
		$scope.chart.series.push(description);
		$scope.chart.series.push(description2);
		deferred.resolve();
		return deferred.promise;
	}
	renderMarkers = function(map) {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	}
	$scope.changeChart = function(chartType) {
		$scope.panelContent = 'templates/' + chartType + '.html';
	}
	$scope.destroy = function() {
		$element.remove();
	}
	// Event listener whenenver map is loaded, ngmaps broadcasts mapInitialized when initaliazed 
	$scope.$on('mapInitialized', function (event, map) {
		renderMarkers(map);
	})
	$scope.getContent('invoicesList.json');
}