/// <reference path="./slugg.d.ts" />

module slugg.service {
  export class NeighborhoodService {
    static $inject = ['$q', '$http', '$timeout'];
    constructor(private $q: ng.IQService, private $http: ng.IHttpService, private $timeout: ng.ITimeoutService) { }

    static _promiseCoordinate(coordinates, $q): ng.IPromise<any> {
      return $q.when(coordinates.map((coordinate) => { return { lat: coordinate[1], lng: coordinate[0] } }));
    }

    static _promiseGeometry(geometry, $q): ng.IPromise<any> {
      if (geometry != null && geometry.type == "MultiPolygon") { return this._promiseCoordinate(geometry.coordinates[0][0], $q); }
      else if (geometry != null && geometry.type == "Polygon") { return this._promiseCoordinate(geometry.coordinates[0], $q); }
      else { return $q.reject("data can't be parsed correctly"); }
    }

    promiseFrom(data): ng.IPromise<service.Neighborhood[]> {
      if (data instanceof service.Neighborhood) { return this.$q.when(data); }
      else if (data != null && angular.isFunction(data.then)) { return data.then(this.promiseFrom) }
      else if (angular.isArray(data)) { return this.$q.all(data.map((item) => { return this.promiseFrom(item) })); }
      else if (data != null && data.properties != null) {
        return NeighborhoodService._promiseGeometry(data.geometry, this.$q).then((coordinates) => {
          if (angular.isString(data.properties.Name)) {
            var name = data.properties.Name
            return this.$q.when(new Neighborhood(name, coordinates));
          } else {
            return this.$q.reject("name property not found");
          }
        });
      }
      else if (data != null && angular.isString(data.name)) { return this.$q.when(new Neighborhood(data.name, [])); }
      else { this.$q.reject("data can't be parsed correctly"); }
    }

    _fetchAll(url?): ng.IPromise<any> {
      return this.$http.get("/assets/data/seattle_hoods.json").then((response: ng.IHttpPromiseCallbackArg<any>) => {
        return this.promiseFrom(response.data.features);
      }).then((neighborhoods) => {
        return {
          config: { url: url },
          data: neighborhoods
        }
      });
    }

    neighborhoodFromName(name: string): ng.IPromise<any> {
      return this._fetchAll(null).then((responseData) => {
        return responseData.data.filter((neighborhood) => {
          return neighborhood.name.toLowerCase() == name.toLowerCase();
        })[0];
      });
    }

    _fetchHoodChildren(): ng.IPromise<any> {
      return this.$http.get("/assets/data/seattle_hood_children.json").then((response: ng.IHttpPromiseCallbackArg<any>) => {
        return this.promiseFrom(response.data.features);
      })
    }

    _fetchByUrl = null;
    _fetchByPromise = null;
    _fetchBy(query): ng.IPromise<any> {
      this._fetchByUrl = query;

      return this._fetchAll(query).then((response) => {
        var data = response.data;
        if (response.config.url == this._fetchByUrl) {
          this._fetchByPromise = null;
          return data.filter((item) => {
            return item.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
          });
        }
        else return this.$q.reject("older query");
      });
    }

    fetchByDelayed(query, delay): ng.IPromise<any> {
      if (this._fetchByPromise == null) {
        this._fetchByPromise = this._fetchBy(query);
        return this._fetchByPromise;
      }
      else {
        this.$timeout.cancel(this._fetchByPromise);
        this._fetchByUrl = query;
        this._fetchByPromise = this.$timeout(() => { return query; }, (delay || 200));
        return this._fetchByPromise.then(this._fetchBy);
      }
    }
  }

  export class Neighborhood {
    constructor(private name, private coordinates: any) { }
  }
}