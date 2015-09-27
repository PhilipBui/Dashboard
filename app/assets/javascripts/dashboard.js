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
	var employeesLocation = []; // Employees location {state, country, how many employees} 
	$scope.panelContent = 'templates/lineChart.html'; // Chooses what content inside panel, {map, line, bar, pie, area}
	$scope.chart = {
		data: [[]], 
		labels: []
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
		var counts = {}; // We combine same addresses and calculate how many employees in each one, since geocoding is an expensive task
		addresses.forEach(function(address) {
			counts[address] = (counts[address] || 0) +1;
		});
		for (var address in counts) {
			var value = counts[address];
			var splitAddress = address.split(', ');
			var state = splitAddress[0];
			var country = splitAddress[1];
			geocoder.geocode({'address' : address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var googlesAddress = results[0].formatted_address;
					var result = results[0].geometry.location;
					var marker = createMarker(googlesAddress + ' has ' + $scope.totalEmployees/value + '% of your employees!', result);
					$scope.markers.push(marker);
				}
				else {
					alert('Could not find address' + status);
				}
				});
			employeesLocation.push([state, country, value]);
		}
		loadChart();
	}
	loadChart = function() {
		$scope.chart.data = [[]];
		$scope.chart.labels = [];
		employeesLocation.forEach(function(data) {
			$scope.chart.data[0].push(data[2]);
			$scope.chart.labels.push(data[0]);
		});
		$scope.chart.data[0].push(0);
		$scope.dataLoaded = true;
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
app.controller('salesFlowController', ['$scope', '$element', '$http', salesFlowController]);
function salesFlowController($scope, $element, $http) {
	
}