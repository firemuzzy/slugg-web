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
    .directive('slideInput', SlideInputDirective)


  SlideInputDirective.$inject = ['$timeout'];

  function SlideInputDirective($timeout){
    return {
      /* for some odd reason angular doesn't like type="email" */
      restrict: 'E',
      template: "<div class='slideInput' ng-class='{focus:focus, hasValue:email.length > 0}'>" +
        "<input type='text' class='slideInput-input' placeholder='{{placeholder}}' ng-model='email' ng-focus='focus=true' ng-blur='focus=false' ng-keyup='$event.keyCode == 13 ? click() : null'/>" +
        "<button class='slideInput-button' ng-show='button' ng-click='click({$event:$event})'>{{button}}</button>" +
        "</div>",
      require: 'ngModel',
      scope: {
        button: "@?",
        placeholder: "@?",
        email: '=ngModel',
        click: '&',
        focus: '=?'
      },
      link: function($scope, element, attrs, ctrl) {
        $scope.$watch("focus", function(value){
          if(value === true) {
            element.find('input')[0].focus();
          }
        });
      }
    }
  }

})();