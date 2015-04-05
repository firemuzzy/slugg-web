(function(){
  'use strict';

  angular
    .module('app.models', [])
    .factory('Company', CompanyModel)
    .factory('Person', PersonModel)
    .factory('Neighborhood', NeighborhoodModel)
    .service('CompanyService', CompanyService)
    .service('PersonService', PersonService)
    .service('NeighborhoodService', NeighborhoodService)


  CompanyService.$inject = ['$q', 'Company'];
  PersonService.$inject = ['$q', 'Person'];
  NeighborhoodService.$inject = ['$q', '$http', 'Neighborhood'];


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
    function Neighborhood(id, name, coordinates){
      this.id = id;
      this.name = name;
      this.coordinates = coordinates;
    }

    //(data:Object) -> :boolean
    Neighborhood.validateJson = function(data){
      if(data.properties && data.geometry) {
        if(data.properties.NEIGH_NUM == null) return false;
        if(data.properties.NEIGHBORHO == null) return false;
        if(data.geometry.coordinates == null) return false;

        data.id = data.properties.NEIGH_NUM;
        data.name = data.properties.NEIGHBORHO;
        data.coordinates = data.geometry.coordinates[0].map(function(item){
          return {lat:item[1],lng:item[0]};
        });

      } else {
        if(data.id == null) return false;
        if(data.name == null) return false;
      }

      return true;
    };
    //(d:Object) -> :Person
    Neighborhood.build = function(d){ return new Neighborhood(d.id, d.name, d.coordinates); };
    //(data:Object) -> :Person | null
    Neighborhood.fromJson = function(data) {
      if(Neighborhood.validateJson(data)){
        //data gets mutated by validateJson
        return Neighborhood.build(data);
      }
    };
    //(responseData:Object) -> :Neighborhood | :Array[Neighborhood]
    Neighborhood.apiResponseTransformer = function(responseData){
      if(angular.isArray(responseData)){
        return responseData.map(Neighborhood.fromJson).filter(Boolean);
      }
      return Neighborhood.fromJson(responseData);
    };

    return Neighborhood;
  }
  function CompanyService($q, Company){

    //() -> :Promise
    this.vettedCompanies = function(){
      return $q.when([
        new Company("Microsoft", "microsoft.com", 246, 500),
        new Company("Google", "google.com", 246, 500),
        new Company("Adobe", "adobe.com", 246, 500)
      ])
    };

    //(domain:String) -> :Promise
    this.companyFromDomain = function(domain){
      return this.vettedCompanies().then(function(companies){
        var companies = companies.filter(function(v){ return v.domain == domain});
        if(companies.length == 0) return $q.reject("no company found");
        else return companies[0];
      });
    };

    //(email:String) -> :Promise
    this.companyFromEmail = function(email){
      var emailParts = email.split("@");
      return this.companyFromDomain(emailParts[emailParts.length - 1]);
    };

    //(name:String) -> :Promise
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
  function NeighborhoodService($q, $http, Neighborhood){
    //(name:String) -> :Promise
    this.neighborhoodFromName = function(name) {
      return $q.when(new Neighborhood(name))
    };


    //() -> :Promise
    this._fetchAll = function(url){
      return $http.get("/assets/data/seattle_hoods.json").then(function(response){
        return {
          config:{ url: url },
          data:Neighborhood.apiResponseTransformer(response.data.features)
        }
      });
    };

    var _fetchByUrl = null;
    var _fetchByPromise = null;
    //(query:String) -> :Promise
    this._fetchBy = function(query) {
      _fetchByUrl =  query;

      return this._fetchAll(query).then(function(response){
        var data = response.data;
        if(response.config.url == _fetchByUrl) {
          _fetchByPromise = null;
          return data.filter(function(item){
            return item.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
          });
        }
        else return $q.reject("older query");
      });
    };

    //(query:String, delay:number = 300) -> :Promise
    this.fetchByDelayed = function(query, delay) {
      if(_fetchByPromise == null){
        _fetchByPromise = this._fetchBy(query);
        return _fetchByPromise;
      }
      else {
        $timeout.cancel(_fetchByPromise);
        _fetchByUrl = query;
        _fetchByPromise = $timeout(function(){ return query; }, (delay || 300));
        return _fetchByPromise.then(this._fetchBy);
      }
    };

  }

})();