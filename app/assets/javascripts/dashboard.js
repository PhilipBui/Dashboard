var app = angular.module('Dashboard', ['ngMap']);

// Controls creation and deletion of widgets AKA directives
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
		templateUrl: 'employeeLocations.html',
		controller: employeeLocationsController
	};
	return directive;
}

// Each panel will have a different controller hence different content.
app.controller('employeeLocationsController', ['$scope', '$element', '$http', '$interval', '$timeout', employeeLocationsController]);
function employeeLocationsController($scope, $element, $http, $interval, $timeout) {	
	$scope.dataLoaded = false;
	$scope.chartType = 'lineChart.html'
	$scope.chart = {
		data: [5, 1],
		labels: ['SA', 'Syd']
	};
	$scope.employeeLocations = [];
	$scope.randomHint = 'Did you know?';
	$scope.totalEmployees = 0;
	getContent = function(resource) {
		$http.get(resource).then( function(result) {
			cleanJson(result.data);
		});
	}
	cleanJson = function(employeeDetailsJSON) {
		var addresses = [];
		for (var i = 0; i < employeeDetailsJSON.content.employees.length; i++) {
			var address = employeeDetailsJSON.content.employees[i].address;
			var splitAddress = address.split(', ');
			var newAddress = splitAddress[splitAddress.length-2] + ', ' + splitAddress[splitAddress.length-1];
			addresses.push(newAddress);
			$scope.employeeLocations.push([employeeDetailsJSON.content.employees[i].gender, employeeDetailsJSON.content.employees[i].hired_date, newAddress]);
		}
		$scope.dataLoaded = true;
		$scope.totalEmployees = employeeLocations.length;
	}
	clean = function() {
		childScope.$destroy();
		$('.panel-body').empty();
	}
	refreshHint = function() {
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

