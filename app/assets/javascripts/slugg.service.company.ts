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
        return this.$q.when(new Company(null, data.name, data.domain, parseInt(data.signups), parseInt(data.maxSignups), 0));
      }
      else return this.$q.reject("data can't be parsed correctly");
    }

    fromParse(parseC: any): service.Company {
      var objectId = parseC.objectId
      var name = parseC.get("name")
      var domain = parseC.get("domain")
      var signups = 0
      var maxSignups = parseInt(parseC.get("maxSignups"))
      var minSignups = parseInt(parseC.get("minSignups"))

      return new Company(objectId, name, domain, signups, maxSignups, minSignups);
    }

    promiseFromNameEmail(name: string, email: string): ng.IPromise<service.Company[]> {
      var emailParts = email.split("@");
      var domain = emailParts[emailParts.length - 1];

      var data = { name: name, domain: domain, signups: 0, maxSignups: 500 }
      return this.promiseFrom(data);
    }

    vettedCompanies():ng.IPromise<Company[]> {
      var Parse = window['Parse']
      var Company = Parse.Object.extend("Company");

      var deferred = this.$q.defer()

      var query = new Parse.Query(Company);
      query.find({
        success: function(results) {
          deferred.resolve(results)
        },
        error: function(error) {
          deferred.reject(error)
        }
      })

      return deferred.promise.then( (results: any[]) => {
        var companies = results.map((r) => { return this.fromParse(r) });
        this.promiseFrom(results)
      });

      // return this.promiseFrom([
      //   { name: "Microsoft", domain: "microsoft.com", signups: 246, maxSignups: 500 },
      //   { name: "Google", domain: "google.com", signups: 246, maxSignups: 500 },
      //   { name: "Adobe", domain: "adobe.com", signups: 246, maxSignups: 500 },
      //   { name: "Starbucks", domain: "starbucks.com", signups: 246, maxSignups: 500 },
      //   { name: "Costco", domain: "costco.com", signups: 246, maxSignups: 500 },
      //   { name: "Boeing", domain: "boeing.com", signups: 246, maxSignups: 500 },
      //   { name: "Nordstrom", domain: "nordstrom.com", signups: 246, maxSignups: 500 },
      //   { name: "Amazon", domain: "amazon.com", signups: 246, maxSignups: 500 },
      //   { name: "Weyerhaeuser", domain: "weyerhaeuser.com", signups: 246, maxSignups: 500 }
      // ]);
    }

    signupsCounts(): ng.IPromise<number> {
      var Parse = window['Parse']

      var Signup = Parse.Object.extend("Signup");
      var query = new Parse.Query(Signup);
      query.equalTo("company", company.name.toLowerCase());

      var deferred = this.$q.defer()

      query.count({
        success: function(count) {
          deferred.resolve(count)
        },
        error: function(error) {
          deferred.reject(error)
        }
      });

      return deferred.promise
    }

    signupsCount(company: Company): ng.IPromise<number> {
      var Parse = window['Parse']

      var Signup = Parse.Object.extend("Signup");
      var query = new Parse.Query(Signup);
      query.equalTo("company", company.name.toLowerCase());

      var deferred = this.$q.defer()

      query.count({
        success: function(count) {
          deferred.resolve(count)
        },
        error: function(error) {
          deferred.reject(error)
        }
      });

      return deferred.promise
    }

    fromDomain(domain: string): ng.IPromise<service.Company> {
      return this.vettedCompanies().then((companies: any[]) => {
        var companies = companies.filter((v) => { return v.domain.toLowerCase() == domain.toLowerCase() });
        if (companies.length == 0) {
          return this.$q.reject("no company found");
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
          return this.$q.reject("no company found");
        } else return companies[0];
      });
    }
  }

  export class Company {
    constructor(public parseId:string, public name: string, public domain: string, public signups: number, public maxSignups: number, minSignups: number) { }
  }
}
