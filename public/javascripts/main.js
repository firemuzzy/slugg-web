(function() {
  "use strict";

  angular
    .module('app', ['ngAnimate', 'app.models', 'ngNewRouter', 'mail', 'goalBar', 'utilDirectives', 'map', 'slideInput'])
    .config(function ($componentLoaderProvider) {
      $componentLoaderProvider.setTemplateMapping(function (name) {
        return "/assets/templates/" + name + ".tpl.html";
      });
    });
})();