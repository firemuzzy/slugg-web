/// <reference path="./slugg.d.ts" />

interface ISignupScope {
  focusEmail:boolean;
  email:string;
  signupEmail($event:ng.IAngularEvent): void;
}

class SignupController implements ISignupScope {

  focusEmail:boolean;
  email:string;

  static $inject = ['PersonService', '$state'];
  constructor(PersonService, private $state: ng.ui.IStateService) {
  }

  signupEmail($event:ng.IAngularEvent) {
    if(this.email === null || this.email.length  <= 0) {
      this.focusEmail = true;
    } else {
      this.$state.go("neighborhood", {'email':this.email})
    }
  }
}

angular.module('app').controller("SignupController", SignupController);