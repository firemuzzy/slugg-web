(function(){
  "use strict";

  angular
    .module('app', ['app.models', 'ngNewRouter', 'ngAnimate', 'mail', 'goalBar', 'utilDirectives', 'map', 'slideInput'])
    .config(function($componentLoaderProvider){ $componentLoaderProvider.setTemplateMapping(function(name){ return "/assets/templates/" + name + ".tpl.html"; }); })
    .controller('AppController', AppController)
    .controller('InviteController', InviteController)
    .controller('NeighborhoodController', NeighborhoodController)
    .controller('SignupController', SignupController);

  AppController.$inject = ['$router'];
  InviteController.$inject = ['$timeout', '$routeParams', 'CompanyService', 'PersonService', 'NeighborhoodService'];
  SignupController.$inject = ['PersonService', '$location'];
  NeighborhoodController.$inject = ['$routeParams', 'CompanyService', 'NeighborhoodService', '$timeout', '$location', 'SlideInputFormatter'];


  function AppController($router){
    $router.config([
      {path:"/", component: 'signup'},
      {path:"/neighborhood/:email", component: 'neighborhood' },
      {path:"/neighborhood/:email/:company", component: 'neighborhood' },
      {path:"/invite/:email/:neighborhood", component: 'invite' },
      {path:"/invite/:email/:neighborhood/:company", component: 'invite' }
    ]);
  }


  function SignupController(PersonService, $location){
    var self = this;

    this.focusEmail = false;

    this.signupEmail = function($event){
      if(self.email == null || self.email.length <= 0) {
        self.focusEmail = true;
      } else {
        $location.path('/neighborhood/' + self.email)
      }
    }
  }
  function NeighborhoodController($routeParams, CompanyService, NeighborhoodService, $timeout, $location, SlideInputFormatter){
    var self = this;

    this.focusNeighborhood = true;
    this.signupNeighborhood = function(value, typeaheadItem){
      if(typeaheadItem) {
        $location.path('/invite/' + $routeParams.email + "/" + typeaheadItem.name);
      } else {
        $location.path('/invite/' + $routeParams.email + "/" + value);
      }
    };

    if($routeParams.company) {
      CompanyService.companyFromName().then(function(company){
        self.company = company;
      }).catch(function(error){
        console.log("name failed" + error);
      });
    } else {
      CompanyService.companyFromEmail($routeParams.email).then(function(company){
        self.company = company;
      }).catch(function(error){
        $timeout(function(){
          $location.path('/');
        });
      });
    }

    this.change = function(model){
      if(model == null || model.length == 0) {
        self.typeaheadData = [];
        return;
      }

      NeighborhoodService.fetchByDelayed(model).then(function(neighborhoods){
        if(model || model.length > 0) self.typeaheadData = neighborhoods;
        else self.typeaheadData = []
      });
    };

    this.typeaheadFormat = function(item, query){ return SlideInputFormatter.injectBold(item.name, query); };
    this.suggestedFormat = function(item, query){ return SlideInputFormatter.afterFirstOccurence(item.name, query); };
    this.typeaheadHoverItem = function(item){
      self.coordinates = item.coordinates;
    };
    this.typeaheadActiveItem = function(item){
      self.coordinates = item.coordinates;
    };

    this.polygonOptions = {
      strokeWeight: 0,
      fill: {
        color: "#000",
        opacity: 0
      }
    };

    this.styles = [{
      "elementType": "geometry",
      "stylers": [ { "saturation": -100 } ]
    },{
      "featureType": "road.highway",
      "stylers": [ { "visibility": "off" } ]
    },{
      "featureType": "road.arterial",
      "stylers": [ { "visibility": "off" } ]
    },{
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [ { "visibility": "off" } ]
    },{
      "featureType": "transit.line",
      "stylers": [ { "visibility": "off" } ]
    }];
  }
  function InviteController($timeout, $routeParams, CompanyService, PersonService, NeighborhoodService){
    var self = this;

    var placeholders = ["your_friend", "your_colleague", "your_buddy", "your_bff", "your_second_bff", "your_frenemy?", "seriously?", "not to be passive agressive...", "but let's enter a name?"];
    var placeholderIndex = 0;

    this.showMail = true;
    this.emailFocus = true;
    this.emailPlaceholder = placeholders[placeholderIndex];
    this.email = $routeParams.email;

    CompanyService.companyFromEmail($routeParams.email).then(function(company){
      self.company = company;
    }).catch(function(error){
      console.log(error);
    });

    NeighborhoodService.neighborhoodFromName($routeParams.neighborhood).then(function(neighborhood){
      self.neighborhood = neighborhood;
    });

    this.sendEmail = function(email){
      if(email != null && email.length > 0) {
        this.emailPlaceholder = placeholders[0];
        PersonService.sendEmail(email, self.company).then(function(timesSent){
          self.numberOfInvites = timesSent;
          if(timesSent == null) {
            self.opened = false;

            $timeout(function(){self.showMail = false; }, 1750)
              .then(function(){ $timeout(function(){ self.showMail = true; self.email = null; }, 1000); })
              .then(function(){ $timeout(function(){ self.opened = true; self.emailFocus = true; self.emailPlaceholder = placeholders[0];  }, 2500); });
          }
        });
      } else {
        self.emailFocus = true;
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        this.emailPlaceholder = placeholders[placeholderIndex];
      }
    };

    $timeout(function(){ self.opened = true; }, 400);
  }

})();