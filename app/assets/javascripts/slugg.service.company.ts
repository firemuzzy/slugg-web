/// <reference path="./angularjs/angular.d.ts" />

class CompanyService {
  constructor(private $q:ng.IQService, private Company:any){}

  vettedCompanies(): any {
    return this.Company.promiseFrom([
      { name: "Microsoft", domain: "microsoft.com", signups: 246, maxSignups: 500 },
      { name: "Google", domain: "google.com", signups: 246, maxSignups: 500 },
      { name: "Adobe", domain: "adobe.com", signups: 246, maxSignups: 500 }
    ]);
  }

  companyFromDomain(domain:string): any {

    return this.vettedCompanies().then((companies: any[]) => {
      var companies = companies.filter((v) => { return v.domain == domain });
      if (companies.length == 0) {
        return this.$q.reject("no compnay found");
      } else return companies[0];
    });

  }

  companyFromEmail(email:string): any {
    var emailParts = email.split("@");
    return this.companyFromDomain(emailParts[emailParts.length - 1]);
  }

  companyFromName(name:string): any {
    return this.vettedCompanies().then((companies: any[]) => {
      return companies[0]
    });
  }
}

angular.module('app').service('CompanyService', CompanyService)