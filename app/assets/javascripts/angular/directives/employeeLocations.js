angular
	.module('Dashboard')
	.directive('employeeLocations', employeeLocations);
	
function employeeLocations() {
	var directive = {
		restrict: 'E',
		templateUrl: 'employeeLocations.html'
	};
	return directive;
}