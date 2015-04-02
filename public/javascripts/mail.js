(function(){
  "use strict";

  angular
    .module('mail', [])
    .directive('mail', MailDirective)

  function MailDirective(){
    var link = function($scope, element, attrs){
      if($scope.assets == null) $scope.assets = "/";
    };

    return {
      template: "<div class='mail' ng-class='{opened:opened}'>" +
                  "<img class='mailFold' src='{{assets}}mailFold.png' />" +
                  "<img class='mailFoldClosed' src='{{assets}}mailFoldClosed.png' />" +
                  "<img class='mailBg' src='{{assets}}mailBg.png' />" +
                  "<div class='mailContent'><div class='mailMessage' ng-transclude></div></div>" +
                  "<img class='mailBottom' src='{{assets}}mailBottom.png' />" +
                "</div>",
      scope: {
        "assets":"@?",
        "opened":"=?"
      },
      replace: true,
      transclude: true,
      link: link
    }
  }

})();