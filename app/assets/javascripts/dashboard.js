var app = angular.module('Dashboard', ['ngMap', 'chart.js']);

// Controller that controls creation and deletion of widgets AKA directives
app.controller('DashboardController', ['$scope', '$compile', dashboardController]); 
function dashboardController($scope, $compile) {
	$scope.addEmployeeLocations = function() {
		var childScope = $scope.$new();
		var compiledDirective = $compile('<employee-locations/>');
		var directiveElement = compiledDirective(childScope);
		$('.container').append(directiveElement);
	};
	$scope.addSaleFlows = function() {
		var childScope = $scope.$new();
		var compiledDirective = $compile('<sale-flows/>');
		var directiveElement = compiledDirective(childScope);
		$('.container').append(directiveElement);
	}
}

// Employee locations widget with its respective controller
app.directive('employeeLocations', employeeLocations);
function employeeLocations() {
	var directive = {
		restrict: 'E',
		templateUrl: 'templates/employeeLocations.html',
		controller: employeeLocationsController
	};
	return directive;
}

// Each panel will have a different controller to control different content.
app.controller('employeeLocationsController', ['$scope', '$element', '$http', '$interval', '$q', employeeLocationsController]);
function employeeLocationsController($scope, $element, $http, $interval, $q) {	
	$scope.dataLoaded = false;
	$scope.panelContent = 'templates/map.html';
	// For use by charts
	$scope.chartType = 'Line';
	$scope.chart = {
		data: [[5, 1]],
		labels: ['SA', 'Syd']
	};
	// For use by maps
	$scope.employeeLocations = [];
	$scope.markers = [
	
	];
	// For use by random hints
	$scope.randomHint = 'Did you know?';
	getContent = function(resource) {
		$http.get(resource).then(function(result) { // Waits for http.get to finish then call function
			cleanJson(result.data);
		});
	}
	cleanJson = function(employeeDetails) {
		var addresses = [];
		for (var i = 0; i < employeeDetails.content.employees.length; i++) { // Can't use forEach or for employees in
			var address = employeeDetails.content.employees[i].address;
			var splitAddress = address.split(', ');
			var newAddress = splitAddress[splitAddress.length-2] + ', ' + splitAddress[splitAddress.length-1];
			addresses.push(newAddress);
		}
		var counts = {};
		addresses.forEach(function(address) {
			counts[address] = (counts[address] || 0) +1;
		});
		var deferred = $q.defer();
		for (var key in counts) {
			var value = counts[key];
			var results = deferred.promise.then(geocodeAddress(key)).then(function(result) { // $q waits for geocode then executes functions
				var data = [key, result.lat, result.lng];
				$scope.markers.push(data);
			});
			$scope.employeeLocations.push([key, value]);
		}
		$scope.chart.data = [[]];
		$scope.chart.labels = [];
		$scope.employeeLocations.forEach(function(data) {
			$scope.chart.data[0].push(data[0]);
			$scope.chart.labels.push(data[1]);
		});
		$scope.dataLoaded = true;
		
	}
	clean = function() {
		childScope.$destroy();
		$('.panel-body').empty();
	}
	refreshHint = function() {
		
	}
	$scope.changeChart = function(chartType) {
		if (chartType == 'Map') {
			$scope.panelContent = 'templates/map.html';
		}
		else {
			$scope.panelContent = 'templates/chart.html';
			$scope.chartType = chartType;
		}
	}
	$scope.destroy = function() {
		$element.remove();
	}
	getContent('employeeDetails.json');
	$interval(refreshHint, 5000);
}
// Each panel will have a different controller hence different content. Sale Flows request different content hence different controller.
app.controller('saleFlowsController', ['$scope', '$element', '$http', saleFlowsController]);
function saleFlowsController($scope, $element, $http) {
	// Local functions don't need to be included in the scope
	fetchContent = function(resource) {
		$http.get(resource).then(function(result){
			return result.data
		});
	}
}

