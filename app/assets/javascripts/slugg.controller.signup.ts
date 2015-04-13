/// <reference path="./slugg.d.ts" />

module slugg.controller {
  export class SignupController {
    focusEmail: boolean;
    email: string;

    static $inject = ['$state', 'Company'];
    constructor(private $state: ng.ui.IStateService, private Company: service.CompanyService) { }

    signupEmail($event: ng.IAngularEvent) {
      if (this.email === null || this.email.length <= 0) {
        this.focusEmail = true;
      } else {
        this.Company.fromEmail(this.email).then((company:service.Company) => {
          
          this.$state.go("neighborhood", { email: this.email, company: company.name });
        }, (error) => {
            this.$state.go("company", { email: this.email });
          });
      }
    }
  }
}