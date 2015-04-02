(function(){
  "use strict";

  angular
    .module('goalBar', [])
    .directive('goalBar', GoalBarDirective)

  function GoalBarDirective(){
    var link = function($scope, element, attrs){
      $scope.$watchGroup(['current', 'goal'], function(newValues, oldValues){
        if(newValues[0] != null && newValues[1] != null) $scope.width = 100 * parseFloat(newValues[0]/newValues[1]);
        else $scope.width = 0;
      });
    };

    return {
      template: "<div class='goalBar'>" +
        "<div class='goalBar-bar'>" +
          "<div class='goalBar-barColor' style='width:{{width}}%'></div>" +
        "</div>" +
        "<div class='goalBar-label'>" +
          "<strong>GOAL</strong>" +
          "<div>{{goal}} carpoolers</div>" +
        "</div>" +
        "</div>",
      scope: {
        "goal":"=",
        "current":"="
      },
      replace: true,
      link: link
    }
  }

})();