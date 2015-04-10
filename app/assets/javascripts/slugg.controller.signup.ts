/// <reference path="./angularjs/angular.d.ts" />
/// <reference path="./parse/parse.d.ts" />


interface ISignupScope {
  focusEmail:boolean;
  email:string;
  signupEmail($event:ng.IAngularEvent): void;
}

class SignupController implements ISignupScope {

  focusEmail:boolean;
  email:string;
  location:ng.ILocationService;

  static $inject = ['PersonService', '$location'];
  constructor(PersonService, private $location:ng.ILocationService){
    this.location = $location;
  }

  signupEmail($event:ng.IAngularEvent) {
    if(this.email === null || this.email.length  <= 0) {
      this.focusEmail = true;
    } else {
    }
    alert("HERE")
  }
}