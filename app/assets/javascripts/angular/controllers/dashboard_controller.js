angular.module('Dashboard')
.controller('DashboardController', function($scope, $compile, $element) {
	$scope.abc = 3;
	var panels = []
	$scope.addEmployeeLocations = function() {
		var childScope = $scope.$new();
		$compile('<div employeeLocations> </div>');
	};
	
})