(function(){
  "use strict";

  angular
    .module('app', ['ngNewRouter', 'mail', 'goalBar'])
    .config(function($componentLoaderProvider){ $componentLoaderProvider.setTemplateMapping(function(name){ return "/assets/templates/" + name + ".tpl.html"; }); })
    .controller('AppController', AppController)
    .controller('InviteController', InviteController);

  AppController.$inject = ['$router'];
  InviteController.$inject = ['$timeout'];

  function AppController($router){
    $router.config([
      {path:"/", component: 'invite' }
    ]);
  }

  function InviteController($timeout){
    var self = this;

    this.signups = 234;
    this.company = "Microsoft";
    this.maxSignups = 500;

    $timeout(function(){
      self.opened = true;
    }, 400)
  }

})();