/// <reference path="./slugg.d.ts" />

angular.module('app', ['ngAnimate', 'ui.router', 'mail', 'goalBar', 'utilDirectives', 'map', 'slideInput'])
  .service("Company", slugg.service.CompanyService)
  .service("Person", slugg.service.PersonService)
  .service("Neighborhood", slugg.service.NeighborhoodService)

  .controller("InviteController", slugg.controller.InviteController)
  .controller("NeighborhoodController", slugg.controller.NeighborhoodController)
  .controller("CompanyController", slugg.controller.CompanyController)
  .controller("SignupController", slugg.controller.SignupController)

  .config(($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
    $urlRouterProvider.otherwise("/");
    $stateProvider
      .state('signup', {
        url: "/",
        views: {
          main: {
            templateUrl: '/assets/templates/signup.tpl.html',
            controller: 'SignupController',
            controllerAs: 'signup',
          }
        }
      })
      .state("company", {
        url: '/:email',
        views: {
          main: {
            templateUrl: '/assets/templates/company.tpl.html',
            controller: 'CompanyController',
            controllerAs: 'company',
          }
        }
      })
      .state("neighborhood", {
        url: '/:email/:company',
        views: {
          main: {
            templateUrl: '/assets/templates/neighborhood.tpl.html',
            controller: 'NeighborhoodController',
            controllerAs: 'neighborhood',
          }
        }
      })
      .state("invite", {
        url: '/:email/:company/:neighborhood',
        views: {
          main: {
            templateUrl: '/assets/templates/invite.tpl.html',
            controller: 'InviteController',
            controllerAs: 'invite',
          }
        }
      });
  })