(function(){
  "use strict";

  angular
    .module('app', ['ngNewRouter'])
    .config(function($componentLoaderProvider){ $componentLoaderProvider.setTemplateMapping(function(name){ return "/assets/templates/" + name + ".tpl.html"; }); })
    .controller('AppController', AppController)
    .controller('InviteController', InviteController);

  AppController.$inject = ['$router'];
  InviteController.$inject = ['$router'];

  function AppController($router){
    $router.config([
      {path:"/", component: 'invite' }
    ]);
  }

  function InviteController(){
    var self = this;

  }

})();