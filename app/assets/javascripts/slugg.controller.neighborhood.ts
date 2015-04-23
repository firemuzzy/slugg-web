/// <reference path="./slugg.d.ts" />

interface INeighborhoodStateParams extends ng.ui.IStateParamsService {
  email: string;
  company: string;
}

module slugg.controller {
  export class NeighborhoodController {
    center: any = { lat: 47.605755, lng: -122.335955 };
    focusNeighborhood: boolean = true;
    company: any;
    typeaheadData: any[];
    activePolygon: any;
    hoverPolygon: any;
    styles: any[] = [
      { "elementType": "geometry", "stylers": [{ "saturation": -100 }] },
      { "featureType": "road.highway", "stylers": [{ "visibility": "off" }] },
      { "featureType": "road.arterial", "stylers": [{ "visibility": "off" }] },
      { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
      { "featureType": "transit.line", "stylers": [{ "visibility": "off" }] }
    ];

    static $inject = ['$stateParams', 'Company', 'Neighborhood', '$state', 'SlideInputFormatter', 'MapHelper', '$q'];
    constructor(private $stateParams: INeighborhoodStateParams,
      private Company:service.CompanyService,
      private Neighborhood:service.NeighborhoodService,
      private $state: ng.ui.IStateService,
      private SlideInputFormatter,
      private MapHelper,
      private $q: ng.IQService) {

      var companyFromNamePromise = Company.fromName($stateParams.company).then((company) => { return company }, () => { return null });
      var companyFromEmailPromise = Company.fromEmail($stateParams.email).then((company) => { return company }, () => { return null });


      this.$q.all([companyFromNamePromise, companyFromEmailPromise]).then((companies) => {
        var companyFromName = companies[0];
        var companyFromEmail = companies[1];

        if (angular.equals(companyFromName, companyFromEmail) && companyFromEmail == null) {
          this.Company.promiseFromNameEmail($stateParams.company, $stateParams.email).then((company) => {
            this.company = company;
          });
        } else if (angular.equals(companyFromName, companyFromEmail) && companyFromEmail != null) {
          this.company = companyFromEmail;
        } else if (companyFromEmail != null) {
          this.$state.go("neighborhood", { email: $stateParams.email, company: companyFromEmail.name });
        } else {
          this.$state.go("signup");
        }
      });

    }

    signupNeighborhood(value: string, typeaheadItem: service.Neighborhood) {
      var neighborhood = (typeaheadItem == null) ? value.toLowerCase() : typeaheadItem.name.toLowerCase();  

      var Parse = window['Parse']
      var Signup = Parse.Object.extend("Signup");

      var signup = new Signup();
      signup.set("email", this.$stateParams.email.toLowerCase())
      signup.set("company", this.$stateParams.company)
      signup.set("neighborhood", neighborhood)

      var acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(false);
      signup.setACL(acl)

      signup.save(null, {
        success: (signup) => {
          this.$state.go("invite", { email: this.$stateParams.email, company: this.$stateParams.company, neighborhood: neighborhood });
        },
        error: (signup, error) => {
          console.log("things happened: " + error.message)
        }
      });
    }

    change(model) {
      if (model == null || model.length == 0) { this.typeaheadData = []; }
      else {
        this.Neighborhood.fetchByDelayed(model, 200).then((neighborhoods) => {
          if (model || model.length > 0) this.typeaheadData = neighborhoods;
          else this.typeaheadData = [];
        });
      }
    }

    typeaheadFormat(item, query) { 
      if(item.parent) {
        return this.SlideInputFormatter.injectBold(item.name + " - " + item.parent.name, query); 
      } else {
        return this.SlideInputFormatter.injectBold(item.name, query); 
      }
    }
    suggestedFormat(item, query) { 
      if (item.parent) {
        return this.SlideInputFormatter.afterFirstOccurence(item.name + " - " + item.parent.name, query);
      } else {
        return this.SlideInputFormatter.afterFirstOccurence(item.name, query);
      }
    }
    typeaheadHoverItem(item) {
      if (item == null) this.hoverPolygon = null;
      else {
        this.hoverPolygon = {
          strokeWeight: 0,
          fillColor: "#63bbfa",
          fillOpacity: 0.2,
          paths: item.coordinates
        };
        this.MapHelper.getCenter(item.coordinates)
          .then((center) => { return this.MapHelper.offsetCenter(center, 0, 300); })
          .then((center) => { this.center = center; });
      }
    }

    typeaheadActiveItem(item) {
      if (item == null) this.activePolygon = null;
      else {
        this.activePolygon = {
          strokeWeight: 0,
          fillColor: "#0771bd",
          fillOpacity: 0.3,
          paths: item.coordinates
        };
        this.MapHelper.getCenter(item.coordinates)
          .then((center) => { return this.MapHelper.offsetCenter(center, 0, 300); })
          .then((center) => { this.center = center; });
      }
    }
  }
}