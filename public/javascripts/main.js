(function(){
  "use strict";

  angular
    .module('app', ['ngNewRouter', 'ngAnimate', 'mail', 'goalBar', 'utilDirectives'])
    .config(function($componentLoaderProvider){ $componentLoaderProvider.setTemplateMapping(function(name){ return "/assets/templates/" + name + ".tpl.html"; }); })
    .factory('Company', CompanyModel)
    .factory('Person', PersonModel)
    .factory('Neighborhood', NeighborhoodModel)
    .service('CompanyService', CompanyService)
    .service('PersonService', PersonService)
    .service('NeighborhoodService', NeighborhoodService)
    .controller('AppController', AppController)
    .controller('InviteController', InviteController)
    .controller('NeighborhoodController', NeighborhoodController)
    .controller('SignupController', SignupController);

  AppController.$inject = ['$router'];
  CompanyService.$inject = ['$q', 'Company'];
  PersonService.$inject = ['$q', 'Person'];
  NeighborhoodService.$inject = ['$q', 'Neighborhood'];
  InviteController.$inject = ['$timeout', '$routeParams', 'CompanyService', 'PersonService', 'NeighborhoodService'];
  SignupController.$inject = ['PersonService', '$location'];
  NeighborhoodController.$inject = ['$routeParams', 'CompanyService', '$timeout', '$location'];


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
  function NeighborhoodController($routeParams, CompanyService, $timeout, $location){
    var self = this;

    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(-34.397, 150.644)
    };

    $timeout(function(){
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    }, 1000);


    this.focusNeighborhood = true;
    this.signupNeighborhood = function(){
      $location.path('/invite/' + $routeParams.email + "/" + this.name);
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
  }
  function InviteController($timeout, $routeParams, CompanyService, PersonService, NeighborhoodService){
    var self = this;

    var placeholders = ["your_friend", "your_colleague", "your_buddy", "your_bff", "your_second_bff", "your_frenemy?", "seriously?", "not to be passive agressive...", "but let's enter a name?"];
    var placeholderIndex = 0;

    this.showMail = true;
    this.emailFocus = true;
    this.emailPlaceholder = placeholders[placeholderIndex];
    this.email = $routeParams.email

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

  function CompanyModel(){
    function Company(name, domain, signups, maxSignups){
      this.name = name;
      this.domain = domain;
      this.signups = signups
      this.maxSignups = maxSignups
    }

    //(data:Object) -> :boolean
    Company.validateJson = function(data){
      if(data.name == null) return false;
      if(data.domain == null) return false;
      if(data.signups == null) return false;
      if(data.maxSignups == null) return false;
      return true;
    };
    //(d:Object) -> :Company
    Company.build = function(d){ return new Company(d.name, d.domain, d.signups, d.maxSignups); };
    //(data:Object) -> :Company | null
    Company.fromJson = function(data) {
      if(Company.validateJson(data)){
        //data gets mutated by validateJson
        return Company.build(data);
      }
    };

    return Company;
  }
  function PersonModel(){
    function Person(email){
      this.email = email;
    }

    //(data:Object) -> :boolean
    Person.validateJson = function(data){
      if(data.email == null) return false;
      return true;
    };
    //(d:Object) -> :Person
    Person.build = function(d){ return new Company(d.email); };
    //(data:Object) -> :Person | null
    Person.fromJson = function(data) {
      if(Person.validateJson(data)){
        //data gets mutated by validateJson
        return Person.build(data);
      }
    };

    return Person;
  }
  function NeighborhoodModel(){
    function Neighborhood(name){
      this.name = name;
    }

    //(data:Object) -> :boolean
    Neighborhood.validateJson = function(data){
      if(data.name == null) return false;
      return true;
    };
    //(d:Object) -> :Person
    Neighborhood.build = function(d){ return new Neighborhood(d.name); };
    //(data:Object) -> :Person | null
    Neighborhood.fromJson = function(data) {
      if(Neighborhood.validateJson(data)){
        //data gets mutated by validateJson
        return Neighborhood.build(data);
      }
    };

    return Neighborhood;
  }
  function CompanyService($q, Company){
    this.vettedCompanies = function(){
      return $q.when([
        new Company("Microsoft", "microsoft.com", 246, 500),
        new Company("Google", "google.com", 246, 500),
        new Company("Adobe", "adobe.com", 246, 500)
      ])
    };

    this.companyFromDomain = function(domain){
      return this.vettedCompanies().then(function(companies){
        var companies = companies.filter(function(v){ return v.domain == domain});
        if(companies.length == 0) return $q.reject("no company found");
        else return companies[0];
      });
    };

    this.companyFromEmail = function(email){
      var emailParts = email.split("@");
      return this.companyFromDomain(emailParts[emailParts.length - 1]);
    };

    this.companyFromName = function(name) {
      return this.vettedCompanies().then(function(companies){
        return companies[0];
      });
    }

  }
  function PersonService($q, Person){
    var emailsSent = {};

    this.sendEmail = function(email, company){
      var key = email + company.domain;
      if(emailsSent[key] == null){
        emailsSent[key] = 1;
        return $q.when(null)
      } else {
        emailsSent[key] += 1;
        return $q.when(emailsSent[key])
      }
    }
  }
  function NeighborhoodService($q, Neighborhood){
    this.neighborhoodFromName = function(name) {
      return $q.when(new Neighborhood(name))
    }
  }

})();