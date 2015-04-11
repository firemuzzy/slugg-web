(function(){
  'use strict';

  angular
    .module('app.models', [])
    .factory('Company', CompanyModel)
    .factory('Neighborhood', NeighborhoodModel)
    .service('PersonService', PersonService)
    .service('NeighborhoodService', NeighborhoodService);


  CompanyModel.$inject = ['$q'];
  NeighborhoodModel.$inject = ['$q'];
  CompanyService.$inject = ['$q', 'Company'];
  PersonService.$inject = ['$q'];
  NeighborhoodService.$inject = ['$q', '$http', '$timeout', 'Neighborhood'];


  function CompanyModel($q){
    function Company(name, domain, signups, maxSignups){
      this.name = name;
      this.domain = domain;
      this.signups = signups;
      this.maxSignups = maxSignups;
    }

    //(data: Object) -> :Promise(:Copmany | [:Company])
    Company.promiseFrom = function(data) {
      if (data instanceof Company) return $q.when(data);
      else if (angular.isArray(data)) return $q.all(data.map(Company.promiseFrom));
      else if (angular.isObject(data) &&
        angular.isString(data.name) &&
        angular.isString(data.domain) &&
        (angular.isString(data.signups) || angular.isNumber(data.signups)) &&
        (angular.isString(data.maxSignups) || angular.isNumber(data.maxSignups))) {
        return $q.when(new Company(data.name, data.domain, data.signups, data.maxSignups));
      }
      else return $q.reject("data can't be parsed correctly");
    };

    return Company;
  }

  function NeighborhoodModel($q){
    function Neighborhood(name, coordinates){
      this.name = name;
      this.coordinates = coordinates;
    }

    var _promiseCoordinate = function(coordinates){
      return $q.when(coordinates.map(function(coordinate){return {lat:coordinate[1], lng: coordinate[0]}}));
    };

    var _promiseGeometry = function(geometry){
      if(geometry != null && geometry.type == "MultiPolygon") {
        return _promiseCoordinate(geometry.coordinates[0][0]);
      } if(geometry != null && geometry.type == "Polygon") {
        return _promiseCoordinate(geometry.coordinates[0]);
      } else {
        return $q.reject("data can't be parsed correctly");
      }
    };

    //(data:Object) -> :Promise(:Neighborhood|[:Neighborhood])
    Neighborhood.promiseFrom = function(data){
      if(data instanceof Neighborhood) {
        return $q.when(data);
      } else if(angular.isArray(data)){
        return $q.all(data.map(Neighborhood.promiseFrom));
      } else if(data != null && data.properties != null){
        return _promiseGeometry(data.geometry).then(function(coordinates){
          if((angular.isString(data.properties.Name))) {
            var name = data.properties.Name
            return new Neighborhood(name, coordinates);
          }
        });
      } else if(data != null && angular.isString(data.name)){
        return new Neighborhood(null, data.name);
      } else{
        $q.reject("data can't be parsed correctly");
      }
    };

    return Neighborhood;
  }

  function CompanyService($q, Company){
    //() -> :Promise
    this.vettedCompanies = function(){
      var c = Company.promiseFrom([
        {name:"Microsoft", domain:"microsoft.com", signups:246, maxSignups:500},
        {name:"Google", domain:"google.com", signups:246, maxSignups:500},
        {name:"Adobe", domain:"adobe.com", signups:246, maxSignups:500}
      ]);
      return c;
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
  function PersonService($q){
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
  function NeighborhoodService($q, $http, $timeout, Neighborhood){
    //(name:String) -> :Promise
    this.neighborhoodFromName = function(name) {
      return this._fetchAll().then(function(responseData){
        return responseData.data.filter(function(neighborhood){
          return neighborhood.name.toLowerCase() == name.toLowerCase();
        })[0];
      });
    };


    //() -> :Promise
    this._fetchAll = function(url){
      return $http.get("/assets/data/seattle_hoods.json").then(function(response){
        return Neighborhood.promiseFrom(response.data.features);
      }).then(function(neighborhoods){
        return {
          config:{ url: url },
          data:neighborhoods
        }
      });
    };

    this._fetchHoodChildren = function() {
      return $http.get("/assets/data/seattle_hood_children.json").then(function(response){
        return Neighborhood.promiseFrom(response.data.features);
      })
    }

    var _fetchByUrl = null;
    var _fetchByPromise = null;
    var self = this;
    //(query:String) -> :Promise
    this._fetchBy = function(query) {
      _fetchByUrl =  query;

      //sometimes "this" is null here, hence why I'm using self
      //not smart enough to figure out why, seems to do with timing/rapidly calling 'fetchByDelayed'
      return self._fetchAll(query).then(function(response){
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

    var self = this;
    //(query:String, delay:number = 300) -> :Promise
    this.fetchByDelayed = function(query, delay) {

      if(_fetchByPromise == null){
        _fetchByPromise = this._fetchBy(query);
        return _fetchByPromise;
      }
      else {
        $timeout.cancel(_fetchByPromise);
        _fetchByUrl = query;
        _fetchByPromise = $timeout(function(){ return query; }, (delay || 200));
        return _fetchByPromise.then(self._fetchBy);
      }
    };

  }

})();
