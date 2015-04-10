/// <reference path="./angularjs/angular-route.d.ts" />
/// <reference path="./angularjs/angular.d.ts" />


interface INeighborhoodRouteParams extends ng.route.IRouteParamsService {
  email:string;
  company?:string;
}

interface INeighborhoodScope {
  center: any;
  company: any;
  focusNeighborhood:boolean;
  signupNeighborhood:Function;
  change:Function;
  typeaheadData: any[];
  typeaheadFormat:Function;
  suggestedFormat:Function;
  typeaheadHoverItem:Function;
  styles:any[];
  activePolygon:any;
  hoverPolygon:any;
  typeaheadActiveItem:Function;

}

class NeighborhoodController implements INeighborhoodScope {
  center: any = {lat:47.605755, lng:-122.335955};
  focusNeighborhood:boolean = true;
  company: any;
  typeaheadData: any[];
  activePolygon: any;
  hoverPolygon: any;
  styles: any[] = [
    {"elementType": "geometry", "stylers": [ { "saturation": -100 } ]},
    {"featureType": "road.highway", "stylers": [ { "visibility": "off" } ]},
    {"featureType": "road.arterial","stylers": [ { "visibility": "off" } ]},
    {"featureType": "poi","elementType": "labels","stylers": [ { "visibility": "off" } ]},
    {"featureType": "transit.line", "stylers": [ { "visibility": "off" } ]}
  ];

  static $inject = ['$routeParams', 'CompanyService', 'NeighborhoodService', '$location', 'SlideInputFormatter', 'MapHelper'];
  constructor(private $routeParams:INeighborhoodRouteParams,
              private CompanyService,
              private NeighborhoodService,
              private $location:ng.ILocationService,
              private SlideInputFormatter,
              private MapHelper){
    NeighborhoodService._fetchAll();

    if($routeParams.company) {
      CompanyService.companyFromName().then( (company) => { this.company = company; });
    } else {
      CompanyService.companyFromEmail($routeParams.email).then( (company) => { this.company = company; }).catch(() => { this.$location.path('/') });
    }
  }

  signupNeighborhood(value:string, typeaheadItem:any) {
    if(typeaheadItem != null){
      this.$location.path("/invite/" + this.$routeParams.email + "/" + typeaheadItem.name);
    } else {
      this.$location.path("/invite/" + this.$routeParams.email + "/" + value);
    }
  }

  change(model) {
    if(model == null || model.length == 0) {
      this.typeaheadData = [];
      return;
    }
    this.NeighborhoodService.fetchByDelayed(model).then((neighborhoods) => {
      if(model || model.length > 0) this.typeaheadData = neighborhoods;
      else this.typeaheadData = [];
    });
  }

  typeaheadFormat(item, query){
    return this.SlideInputFormatter.injectBold(item.name, query);
  }
  suggestedFormat(item, query){
    return this.SlideInputFormatter.afterFirstOccurence(item.name, query);
  }
  typeaheadHoverItem(item){
    if(item == null) this.hoverPolygon = null;
    else {
      this.hoverPolygon = {
        strokeWeight: 0,
        fillColor: "#63bbfa",
        fillOpacity: 0.2,
        paths: item.coordinates
      };
      this.MapHelper.getCenter(item.coordinates)
        .then( (center) => { return this.MapHelper.offsetCenter(center, 0, 300); })
        .then( (center) => { this.center = center; });
    }
  }

  typeaheadActiveItem(item){
    if(item == null) this.activePolygon = null;
    else {
      this.activePolygon = {
          strokeWeight: 0,
          fillColor: "#0771bd",
          fillOpacity: 0.3,
          paths: item.coordinates
      };
      this.MapHelper.getCenter(item.coordinates)
        .then( (center) => { return this.MapHelper.offsetCenter(center, 0, 300); })
        .then( (center) => { this.center = center; });
    }
  }
}

angular.module('app').controller("NeighborhoodController", NeighborhoodController);