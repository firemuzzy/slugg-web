/// <reference path="./slugg.d.ts" />

module slugg.controller {
  export class ModalSignupController {
    emailFocus: boolean;
    email: string = "";

    static $inject = ['$modalInstance', '$timeout'];
    constructor(private $modalInstance, private $timeout:ng.ITimeoutService) {
      this.$timeout(() => {
        this.emailFocus = true;
      }, 300);
    }

    signupEmail() {
      if (this.email === null || this.email.length <= 0) {
        this.emailFocus = true;
      } else {
        this.$modalInstance.close(this.email);
      }
    }

  }

  export class SignupController {
    companies: service.Company[] = [];

    static $inject = ['$state', 'Company', '$modal'];
    constructor(private $state: ng.ui.IStateService, private CompanyService: service.CompanyService, private $modal) {

      this.CompanyService.pilotCompanies().then((companies) => {
        this.companies = companies;
      });
    }


    signup() {
      this.$modal.open({
        templateUrl: '/assets/templates/modalSignup.tpl.html',
        controller: 'ModalSignupController as modalSignup',
      }).result.then((email) => {
        this.CompanyService.fromEmail(email).then((company: service.Company) => {
          this.$state.go("neighborhood", { email: email, company: company.parseId });
        }, (error) => {
          this.$state.go("signupCompany", { email: email });
        });
      });
    }
  }
}