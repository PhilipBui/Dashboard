angular
	.module('Dashboard')
	.directive('map', map);

function map() {
	var directive = {
		restrict: 'E'
		templateUrl: 'map.html'
	};
	return directive;
}