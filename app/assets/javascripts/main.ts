/// <reference path="./slugg.d.ts" />

angular.module('app', ['ngAnimate', 'ui.router', 'ui.bootstrap', 'mail', 'goalBar', 'utilDirectives', 'map', 'slideInput'])
  
  .service("Company", slugg.service.CompanyService)
  .service("Person", slugg.service.PersonService)
  .service("Neighborhood", slugg.service.NeighborhoodService)

  .controller("InviteController", slugg.controller.InviteController)
  .controller("NeighborhoodController", slugg.controller.NeighborhoodController)
  .controller("SignupCompanyController", slugg.controller.SignupCompanyController)
  .controller("SignupController", slugg.controller.SignupController)
  .controller("CompanyController", slugg.controller.CompanyController)
  .controller("ModalSignupController", slugg.controller.ModalSignupController)

  .config(($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
    var Parse = window['Parse']
    
    Parse.initialize("O1isyowqTC3RCVoKJ9PniNuiMJlFqWXYPJrykpU1", "Mb61cVtMaQAh3vIqlhXyzdrPsf2o3Nc612qUfwkO");

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
      .state('company', {
        url: "/company/:company",
        views: {
          main: {
            templateUrl: '/assets/templates/company.tpl.html',
            controller: 'CompanyController',
            controllerAs: 'company',
          }
        }
      })
      .state("signupCompany", {
        url: '/:email',
        views: {
          main: {
            templateUrl: '/assets/templates/signupCompany.tpl.html',
            controller: 'SignupCompanyController',
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