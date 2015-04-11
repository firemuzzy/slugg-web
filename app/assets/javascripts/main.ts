/// <reference path="./slugg.d.ts" />

angular.module('app', ['ngAnimate', 'ui.router', 'app.models', 'mail', 'goalBar', 'utilDirectives', 'map', 'slideInput'])
  .config(($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
    $urlRouterProvider.otherwise("/");
    $stateProvider
      .state('signup', {
        url:"/",
        views:{
          main:{
            templateUrl: '/assets/templates/signup.tpl.html',
            controller: 'SignupController',
            controllerAs: 'signup',
          }
        }
      })
      .state("neighborhood", {
        url: '/:email?company',
        views: {
          main: {
            templateUrl: '/assets/templates/neighborhood.tpl.html',
            controller: 'NeighborhoodController',
            controllerAs: 'neighborhood',
          }
        }
      })
      .state("invite", {
        url: '/:email/:neighborhood?company',
        views: {
          main: {
            templateUrl: '/assets/templates/invite.tpl.html',
            controller: 'InviteController',
            controllerAs: 'invite',
          }
        }
      });
  })