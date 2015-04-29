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

      var companyId = $stateParams.company
      var email = $stateParams.email

      if (companyId.length <= 0) {
        this.redirectToSignupCompany(email);
      } else {
        Company.findById($stateParams.company).then((company) => {
          if(company == null) {
            this.redirectToSignupCompany(email);
          } else {
            this.company = company
          }
        }, (error) => {
          console.error("neighbohoods controller - could not find company by id " + $stateParams.company + " error: " + error.message)
        });
      }
    }

    private redirectToSignupCompany(email: string) {
      this.$state.go("signupCompany", { email: email });
    }

    signupViaParse(email:string, company:service.Company, neighborhood) {
      var deferred = this.$q.defer();

      var Parse = window['Parse']
      var Signup = Parse.Object.extend("Signup");
      var Company = Parse.Object.extend("Company");

      var parseCompany = new Company()
      parseCompany.id = company.parseId

      var signup = new Signup();
      signup.set("email", email.toLowerCase())
      signup.set("company", parseCompany);
      signup.set("neighborhood", neighborhood);

      var acl = new Parse.ACL();
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      signup.setACL(acl)

      signup.save(null, {
        success: (signup) => {
          deferred.resolve({email:email, company:company, neighborhood:neighborhood});
        }, error: (signup, error) => {
          deferred.reject(error.message);
          console.log("could not save signup: " + error.message)
        }
      });
      return deferred.promise;
    }

    signupNeighborhood(value: string, typeaheadItem: service.Neighborhood) {
      var neighborhood = (typeaheadItem == null) ? value.toLowerCase() : typeaheadItem.name.toLowerCase();  

      console.log("signupNeighborhood company id:" + this.$stateParams.company);

      this.Company.findById(this.$stateParams.company).then((company) => {
        return this.signupViaParse(this.$stateParams.email, company, neighborhood);
      }).then((obj:any) => {
        this.$state.go("invite", { email: obj.email, company: obj.company.parseId, neighborhood: neighborhood });
      }).catch( (error) => {
        console.log("failed signupNeighborhood: " + error);
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