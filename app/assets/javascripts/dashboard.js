var app = angular.module('Dashboard', ['ngMap']);

app.controller('DashboardController', ['$scope', '$compile', '$element', dashboardController]); 
function dashboardController($scope, $compile, $element) {
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

app.directive('employeeLocations', employeeLocations);
function employeeLocations() {
	var directive = {
		restrict: 'E',
		templateUrl: 'employeeLocations.html'
	};
	return directive;
}

app.controller('employeeLocationsController', ['$scope', '$element', '$http', employeeLocationsController]);
function employeeLocationsController($scope, $element, $http) {	
	$scope.data = [5, 10];
	$scope.series = ["sa", "sa2"];
	$scope.chartType = "line";
	$scope.addEmployeeLocations = 3;
	var childScope;
	$scope.url = 'employeeLocations.json'
	$scope.buildMap = function() {
		childScope = $scope.$new;
	}
	$scope.clean = function() {
		childScope.$destroy();
		$('.panel-body').empty();
	}
	$scope.destroy = function() {
		$element.remove();
	}
	fetchContent = function(resource) {
		$http.get(resource).then(function(result){
			return result.data
		});
	}
	$scope.content = fetchContent('employeeList.json')
}

app.directive('mapChart', map);
function map() {
	var directive = {
		restrict: 'E',
		scope: false,
		templateUrl: 'map.html'
	};
	return directive;
}
app.directive('line', line);
function line() {
	var directive = {
		restrict: 'E',
		templateUrl: 'map.html'
	};
	return directive;
}