/// <reference path="./slugg.d.ts" />

module slugg.service {
  export class CompanyService {
    constructor(public $q: ng.IQService) { }

    promiseFrom(data: any): ng.IPromise<service.Company[]> {
      if (data instanceof Company) return this.$q.when(data);
      else if (angular.isArray(data)) return this.$q.all(data.map((company) => { return this.promiseFrom(company) }));
      else if (angular.isObject(data) &&
        angular.isString(data.name) &&
        angular.isString(data.domain) &&
        (angular.isString(data.signups) || angular.isNumber(data.signups)) &&
        (angular.isString(data.maxSignups) || angular.isNumber(data.maxSignups))) {
        return this.$q.when(new Company(data.name, data.domain, parseInt(data.signups), parseInt(data.maxSignups)));
      }
      else return this.$q.reject("data can't be parsed correctly");
    }

    promiseFromNameEmail(name: string, email: string): ng.IPromise<service.Company[]> {
      var emailParts = email.split("@");
      var domain = emailParts[emailParts.length - 1];

      var data = { name: name, domain: domain, signups: 0, maxSignups: 500 }
      return this.promiseFrom(data);
    }

    vettedCompanies():ng.IPromise<Company[]> {
      return this.promiseFrom([
        { name: "Microsoft", domain: "microsoft.com", signups: 246, maxSignups: 500 },
        { name: "Google", domain: "google.com", signups: 246, maxSignups: 500 },
        { name: "Adobe", domain: "adobe.com", signups: 246, maxSignups: 500 }
      ]);
    }

    fromDomain(domain: string): ng.IPromise<service.Company> {
      return this.vettedCompanies().then((companies: any[]) => {
        var companies = companies.filter((v) => { return v.domain.toLowerCase() == domain.toLowerCase() });
        if (companies.length == 0) {
          return this.$q.reject("no compnay found");
        } else return companies[0];
      });
    }

    fromEmail(email: string): ng.IPromise<service.Company> {
      var emailParts = email.split("@");
      return this.fromDomain(emailParts[emailParts.length - 1]);
    }

    fromName(name: string): ng.IPromise<service.Company> {
      return this.vettedCompanies().then((companies: any[]) => {
        var companies = companies.filter((v) => { return v.name.toLowerCase() == name.toLowerCase() });
        if (companies.length == 0) {
          return this.$q.reject("no compnay found");
        } else return companies[0];
      });
    }
  }

  export class Company {
    constructor(public name: string, public domain: string, public signups: number, public maxSignups: number) { }
  }
}
