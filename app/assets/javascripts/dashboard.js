var app = angular.module('Dashboard', ['ngMap']);

app.controller('DashboardController', ['$scope', DashboardController]); 
function DashboardController($scope) {
	$scope.abc = 3;
	var panels = [];
	$scope.addEmployeeLocations = function() {
		var childScope = $scope.$new();
		$compile('<div employeeLocations> </div>');
	};
}

app.directive('employeeLocations', employeeLocations);
function employeeLocations() {
	var directive = {
		restrict: 'E',
		templateUrl: 'employeeLocations.html'
	};
	return directive;
}

app.controller('employeeLocationsController', ['$scope', function($scope) {	
	$scope.data = [5, 10];
	$scope.series = ["sa", "sa2"];
	$scope.chartType = "line";
	var childScope;
	$scope.buildMap = function ($scope) {
		
	}
}])

app.directive('map', map);
function map() {
	var directive = {
		restrict: 'E',
		templateUrl: 'map.html'
	};
	return directive;
}