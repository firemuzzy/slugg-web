(function() {
  "use strict";

  //handles negative value correctly
  Math.mod = function(value, modder){
    if(value < 0){
      var loops = (-value)/modder;
      return (value + parseInt(loops+1)*modder) % modder;
    } else return value % modder;
  };

  angular.module("utilDirectives", ['ngSanitize'])
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
      template: "<div class='slideInput' ng-class='{focus:focus, hasValue:model.length > 0}'>" +
        "<div class='slideInput-box'>" +
          "<input type='text' class='slideInput-input' placeholder='{{placeholder}}' ng-model='model' ng-focus='focus=true' ng-blur='focus=false' ng-keyup='_keyup($event)' ng-change='_change()'/>" +
          "<button class='slideInput-button' ng-show='button' ng-click='click({$event:$event})'>{{button}}</button>" +
        "</div>" +
        "<div class='slideInput-typeahead slideInput-box'>" +
          "<div class='slideInput-typeaheadItem' ng-class='{\"slideInput-typeaheadItem-active\":typeaheadHoverIndex == ($index+1)}' ng-repeat='item in typeaheadData track by (item.id || $id(item))' ng-bind-html='typeaheadFormat({item:item, query:model})'></div>" +
        "</div>" +
        "</div>",
      require: 'ngModel',
      scope: {
        button: "@?",
        placeholder: "@?",
        model: '=ngModel',
        click: '&',
        focus: '=?',
        typeaheadData: '=',
        change: '&',
        typeaheadFormat: '&'
      },
      link: function($scope, element, attrs, ctrl) {
        $scope.typeaheadHoverIndex = 0;

        $scope.$watch("focus", function(value){
          if(value === true) {
            element.find('input')[0].focus();
          }
        });

        $scope._keyup = function($event) {
          if($event.keyCode == 13) { //enter
            $scope.click($event);
          } else if($event.keyCode == 40) { //down
            var length = 1;
            if($scope.typeaheadData && $scope.typeaheadData.length > 0) length = $scope.typeaheadData.length + 1;
            $scope.typeaheadHoverIndex = Math.mod($scope.typeaheadHoverIndex + 1, length);
          } else if($event.keyCode == 38) { //up
            var length = 1;
            if($scope.typeaheadData && $scope.typeaheadData.length > 0) length = $scope.typeaheadData.length + 1;
            $scope.typeaheadHoverIndex = Math.mod($scope.typeaheadHoverIndex - 1, length);
          }
        };
        $scope._change = function(){
          $scope.change({model:$scope.model});
        }
      }
    }
  }

})();