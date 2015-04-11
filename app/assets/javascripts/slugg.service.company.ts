/// <reference path="./slugg.d.ts" />
/// <reference path="slugg.models.company.ts" />

class CompanyService {
  static $inject = ["$q", "Company"];
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

  public companyFromEmail(email:string): any {
    var emailParts = email.split("@");
    return this.companyFromDomain(emailParts[emailParts.length - 1]);
  }

  companyFromName(name:string): any {
    return this.vettedCompanies().then((companies: any[]) => {
      var companies = companies.filter((v) => { return v.name == name });
      if (companies.length == 0) {
        return this.$q.reject("no compnay found");
      } else return companies[0];
    });
  }
}

angular.module('app').service('CompanyService', CompanyService)