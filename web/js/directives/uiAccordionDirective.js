angular.module("bompreco").directive("uiAccordions", function () {
	return {
		controller: function ($scope, $element, $attrs, $http) {
			var accordions = [];

			this.registerAccordion = function (accordion) {
				accordions.push(accordion);
			};

			this.closeAll = function () {
				accordions.forEach(function (accordion) {
					accordion.isOpened = false;
				});
			}
		}
	};
});
angular.module("bompreco").directive("uiAccordion", function () {
	return {
		templateUrl: "templates/accordion.html",
		transclude: true,
		scope: {
			title: "@",
			codigo: "@",
			categoria: "@"
		},
		require: "^uiAccordions",
		link: function (scope, element, attrs, ctrl) {
			ctrl.registerAccordion(scope);
			scope.open = function () {
				if(scope.isOpened){
					return ctrl.closeAll();
				}else{
					ctrl.closeAll();
					scope.isOpened = true;
				}
			};
		}
	};
});