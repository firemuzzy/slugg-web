/// <reference path="./slugg.d.ts" />

class AppController {
  // static $inject = ['$router'];
  constructor(){
    // $router.config([
    //   {path:"/", component: 'signup'},
    //   {path:"/neighborhood/:email", component: 'neighborhood' },
    //   {path:"/neighborhood/:email/:company", component: 'neighborhood' },
    //   {path:"/invite/:email/:neighborhood", component: 'invite' },
    //   {path:"/invite/:email/:neighborhood/:company", component: 'invite' }
    // ]);
  }
}

angular.module('app').controller("AppController", AppController);