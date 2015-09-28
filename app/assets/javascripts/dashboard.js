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
		var addresses = [];
		for (var i = 0; i < employeeDetails.content.employees.length; i++) {
			var address = employeeDetails.content.employees[i].address;
			var splitAddress = address.split(', ');
			var state = splitAddress[splitAddress.length-2].replace(/[0-9]/g, '');
			var country = splitAddress[splitAddress.length-1];
			var newAddress = state + ', ' + country;
			addresses.push(newAddress);
		}
		$scope.totalEmployees = addresses.length;
		employeesLocation = {}; // We combine same addresses and calculate how many employees in each one, since geocoding is an expensive task
		addresses.forEach(function(address) {
			employeesLocation[address] = (employeesLocation[address] || 0) +1;
		});
		$q.all([loadMarkers(employeesLocation), loadChart('Employee Locations', employeesLocation)]).then(function() {
			$scope.dataLoaded = true;
		});
		
	}
	loadMarkers = function(markerData) {
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
					alert('Could not find address' + status);
				}
			});
		}
	}
	loadChart = function(description, chartData) { // chartData must be in the form of [[label, data]]
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
	var salesFlow = []; // Sales Flow location {state, country, how much sales} 
	$scope.panelContent = 'templates/lineChart.html'; // Chooses what content inside panel, {map, line, bar, pie, area}
	$scope.chart = {
		data: [[], []], 
		labels: [],
		series: []
	};
	var markers = []; // Google Map Markers
	$scope.totalSales = 0; // Total sales found
	var locationInvoicesDue = {};
	var locationInvoicesPaid = {};
	$scope.getContent = function(resource) {
		$scope.dataLoaded = false
		$http.get(resource).then(function(result) { // Waits for $http.get to finish then call function
			loadContent(result.data);
		});
	}
	loadContent = function(invoicesList) {
		var addresses = [];
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
			}
			newAddress.replace('-', '');
			var totalPaid = invoicesList.content.entities[i].total_paid;
			var totalDue = invoicesList.content.entities[i].total_due;
			if (totalPaid == null) {
				totalPaid = 0;
			}
			if (totalDue == null) {
				totalDue = 0;
			}
			if (newAddress != '') {
				addresses.push([newAddress, totalPaid, totalDue]);
			}
		}
		invoicesPaid = {}; // We combine same addresses and calculate how much invoices paid in each one, since geocoding is an expensive task
		invoicesDue = {}; // We combine same addresses and calculate how much invoices due in each one, since geocoding is an expensive task
		$scope.totalSales = 0;
		addresses.forEach(function(address) {
			invoicesPaid[address[0]] = (invoicesPaid[address] || 0) + address[1];
			invoicesDue[address[0]] = (invoicesDue[address] || 0) + address[2];
			$scope.totalSales += address[2];
		});
		$q.all([loadMarkers(invoicesPaid, invoicesDue), loadChart('Invoices Paid', invoicesPaid, 'Invoices Due', invoicesDue)]).then(function() {
			$scope.dataLoaded = true;
		});
	}
	loadMarkers = function(markerData, markerData2) {
		markers = [];
		for (var address in markerData) {
			var invoicesPaidAmount = markerData[address];
			var invoicesDueAmount = markerData2[address];
			geocoder.geocode({'address' : address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var googlesAddress = results[0].formatted_address;
					var result = results[0].geometry.location;
					var marker = createMarker(googlesAddress + ' has ' + invoicesPaidAmount + ' sales flow with expected ' + invoicesDueAmount + '!', result);
					markers.push(marker);
				}
				else {
					console.log('Could not find address' + status);
				}
			});
		}
	}
	loadChart = function(description, chartData, description2, chartData2) { // chartData must be in the form of [[label, data]]
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
		$scope.chart.data[0].push(0);
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