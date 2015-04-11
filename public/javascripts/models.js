(function(){
  'use strict';

  angular
    .module('app.models', ['app.models.company', 'app.models.neighborhood'])
    .service('PersonService', PersonService)
    .service('NeighborhoodService', NeighborhoodService);


  PersonService.$inject = ['$q'];
  NeighborhoodService.$inject = ['$q', '$http', '$timeout', 'Neighborhood'];

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
