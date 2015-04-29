/// <reference path="./slugg.d.ts" />

interface ICompanyStateParams extends ng.ui.IStateParamsService {
  email: string;
}

module slugg.controller {
  export class SignupCompanyController {
    name: string;
    email: string;
    nameFocus: boolean = true;

    static $inject = ['$state', '$stateParams', 'Company', '$q'];
    constructor(private $state: ng.ui.IStateService, private $stateParams: ICompanyStateParams, private CompanyService:service.CompanyService, private $q:ng.IQService) {
      var email = $stateParams.email;
      this.email = email;

      this.CompanyService.fromEmail(email).then((company) => {
        if (company == null) {
          console.info("company signup controller - could not find company for email " + email);
          // do nothirng because could not find company
        } else {
          this.redirectToNeighborhoodSelector(email, company);
        }
      }, (error) => {
        console.error("company signup controller - could not find company by email " + email + " error: " + error.message);
      });
    }

    private redirectToNeighborhoodSelector(email: string, company: service.Company) {
      this.$state.go("neighborhood", { email: email, company: company.parseId });
    }

    signupCompany(name: string, postalCode:string, hrEmail:string) {
      if (angular.isString(name) && name.length > 0) {
        var email = this.$stateParams.email;

        this.CompanyService.findByNameAndEmail(name, email).then((company) => {
          if (company == null) {
            return this.CompanyService.create(name, email, postalCode, hrEmail);
          } else {
            return this.$q.when(company);
          }
        }).then( (company:service.Company) => {
          this.CompanyService.addLocalCompany(company);
          this.$state.go("neighborhood", { email: this.$stateParams.email, company: company.parseId });
        }, (error) => {
          console.log("failed signupCompany: " + error.message);
        });

      } else {
        this.nameFocus = true;
      }
    }
  }
}