/// <reference path="./slugg.d.ts" />

module model {
  export class NeighborhoodProvider {
    static $inject = ['$q'];
    constructor(public $q: ng.IQService) {
      Neighborhood.$q = $q;
      return Neighborhood;
    }
  }

  export class Neighborhood {
    static $q: ng.IQService;

    constructor(private name: string, private coordinates: any) { }

    static _promiseCoordinate(coordinates): ng.IPromise<any> {
      return Neighborhood.$q.when(coordinates.map((coordinate) => { return { lat: coordinate[1], lng: coordinate[0] } }));
    }

    static _promiseGeometry(geometry): ng.IPromise<any> {
      if (geometry != null && geometry.type == "MultiPolygon") { return Neighborhood._promiseCoordinate(geometry.coordinates[0][0]); }
      else if (geometry != null && geometry.type == "Polygon") { return Neighborhood._promiseCoordinate(geometry.coordinates[0]); }
      else { return Neighborhood.$q.reject("data can't be parsed correctly"); }
    }

    static promiseFrom(data):ng.IPromise<any> {
      if (data instanceof Neighborhood) { return Neighborhood.$q.when(data); }
      else if (data != null && angular.isFunction(data.then)) { return data.then(Neighborhood.promiseFrom) }
      else if (angular.isArray(data)) { return Neighborhood.$q.all(data.map(Neighborhood.promiseFrom)); }
      else if (data != null && data.properties != null) {
        return Neighborhood._promiseGeometry(data.geometry).then((coordinates) => {
          if(angular.isString(data.properties.Name)){
            var name = data.properties.Name
            return Neighborhood.$q.when(new Neighborhood(name, coordinates));
          } else {
            return Neighborhood.$q.reject("name property not found");
          }
          
        });
      }
      else if (data != null && angular.isString(data.name)) { return Neighborhood.$q.when(new Neighborhood(data.name, [])); }
      else { Neighborhood.$q.reject("data can't be parsed correctly"); } 
    }
  }
}

angular.module('app.models.neighborhood', []).factory("Neighborhood", model.NeighborhoodProvider);