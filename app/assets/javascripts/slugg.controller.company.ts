/// <reference path="./slugg.d.ts" />

interface ICompanyStateParams extends ng.ui.IStateParamsService {
  email: string;
}

module slugg.controller {
  export class CompanyController {
    name: string;
    email: string;
    nameFocus: boolean = true;

    static $inject = ['$state', '$stateParams', 'Company'];
    constructor(private $state: ng.ui.IStateService, private $stateParams: ICompanyStateParams, private CompanyService) {
      this.email = $stateParams.email;
    }

    signupCompany(name: string) {
      if (angular.isString(name) && name.length > 0) {
        this.$state.go("neighborhood", { email: this.$stateParams.email, company: name })
      } else {
        this.nameFocus = true;
      }
    }
  }
}