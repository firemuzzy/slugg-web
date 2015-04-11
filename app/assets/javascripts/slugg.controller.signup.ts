/// <reference path="./slugg.d.ts" />
/// <reference path="./slugg.service.company.ts" />

class SignupController {
  focusEmail:boolean;
  email:string;

  static $inject = ['$state', 'CompanyService'];
  constructor(private $state: ng.ui.IStateService, private CompanyService) {}

  signupEmail($event:ng.IAngularEvent) {
    if(this.email === null || this.email.length  <= 0) {
      this.focusEmail = true;
    } else {
      this.CompanyService.companyFromEmail(this.email).then((company) => {
        this.$state.go("neighborhood", { email: this.email, company: company.name });
      }, (error) => {
        this.$state.go("company", {email:this.email});
      });
    }
  }
}

angular.module('app').controller("SignupController", SignupController);