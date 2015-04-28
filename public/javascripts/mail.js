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
                  "<img class='mailFold' ng-src='{{assets}}mailFold.png' />" +
                  "<img class='mailFoldClosed' ng-src='{{assets}}mailFoldClosed.png' />" +
                  "<img class='mailBg' ng-src='{{assets}}mailBg.png' />" +
                  "<div class='mailContent'><div class='mailMessage' ng-transclude></div></div>" +
                  "<img class='mailBottom' ng-src='{{assets}}mailBottom.png' />" +
                  "<img class='mailStamp' ng-src='{{assets}}mailStamp.png' />" +
                  "<img class='mailLogo' ng-show='logo' ng-src='{{assets}}{{logo}}' />" +
                "</div>",
      scope: {
        "assets":"@?",
        "opened":"=?",
        "logo":"@?"
      },
      replace: true,
      transclude: true,
      link: link
    }
  }

})();