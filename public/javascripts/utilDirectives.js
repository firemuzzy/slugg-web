(function() {
  "use strict";

  angular.module("utilDirectives", [])
    .directive('focusWhen', function($timeout) {
      return {
        scope: { trigger: '=focusWhen' },
        link: function(scope, element) {
          scope.$watch('trigger', function(value) {
            if(value === true) { element[0].focus(); scope.trigger = false; }
          });
        }
      };
    })

})();