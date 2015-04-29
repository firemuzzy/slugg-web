/// <reference path="./slugg.d.ts" />

module slugg.service {
  export class CompanyService {
    private localCompanies: Company[] = []

    constructor(public $q: ng.IQService) { }

    addLocalCompany(company: Company) {
      this.localCompanies.push(company)
    }

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
      var parseId = parseC.id
      var name = parseC.get("name")
      var domain = parseC.get("domain")
      var signups = parseInt(parseC.get("signups"))
      var maxSignups = parseInt(parseC.get("maxSignups"))
      var minSignups = parseInt(parseC.get("minSignups"))

      return new Company(parseId, name, domain, signups, maxSignups, minSignups);
    }

    promiseFromNameEmail(name: string, email: string): ng.IPromise<service.Company[]> {
      var emailParts = email.split("@");
      var domain = emailParts[emailParts.length - 1];

      var data = { name: name, domain: domain, signups: 0, maxSignups: 500 }
      return this.promiseFrom(data);
    }

    private vettedCompaniesPromise = null
    private vettedCompanies():ng.IPromise<Company[]> {
      if(this.vettedCompaniesPromise != null) {
        return this.vettedCompaniesPromise;
      }

      var Parse = window['Parse'];
      var Company = Parse.Object.extend("Company");

      var deferred = this.$q.defer();

      var query = new Parse.Query(Company);
      query.equalTo("verified", true);

      query.find({
        success: (results) => {
          var company = results.map((res) => { return this.fromParse(res) });
          deferred.resolve(company);
        },
        error: (error) => {
          deferred.reject(error);
        }
      })

      this.vettedCompaniesPromise = deferred.promise;
      return this.vettedCompaniesPromise;

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

    vettedAndLocalCompanies(): ng.IPromise<Company[]> {
      return this.vettedCompanies().then((companies) => {
        return companies.concat(this.localCompanies);
      });
    }

    // signupsCounts(): ng.IPromise<number> {
    //   var Parse = window['Parse']

    //   var Signup = Parse.Object.extend("Signup");
    //   var query = new Parse.Query(Signup);
    //   query.equalTo("company", company.name.toLowerCase());

    //   var deferred = this.$q.defer()

    //   query.count({
    //     success: function(count) {
    //       deferred.resolve(count)
    //     },
    //     error: function(error) {
    //       deferred.reject(error)
    //     }
    //   });

    //   return deferred.promise
    // }

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
      return this.vettedAndLocalCompanies().then((companies: any[]) => {
        var companies = companies.filter((v) => { 
          return v.domain.toLowerCase() == domain.toLowerCase() 
        });
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
      return this.vettedAndLocalCompanies().then((companies: any[]) => {
        var companies = companies.filter((v) => { return v.name.toLowerCase() == name.toLowerCase() });
        if (companies.length == 0) {
          return this.$q.reject("no company found");
        } else return companies[0];
      });
    }

    private findByIdPromiseArr = {}
    findById(parseId: string): ng.IPromise<service.Company> {
      var foundP = this.findByIdPromiseArr[parseId];
      if (foundP != null) {
        return foundP
      }

      var deferred = this.$q.defer();

      var Parse = window['Parse']

      var Company = Parse.Object.extend("Company");
      var query = new Parse.Query(Company);
      query.equalTo("objectId", parseId);

      query.first({
        success: (result) => {
          var company = this.fromParse(result)
          deferred.resolve(company);
        },
        error: (error) => {
          deferred.reject(error);
        }
      });

      this.findByIdPromiseArr[parseId] = deferred.promise
      return deferred.promise
    }

    findByNameAndEmail(name: string, email: string): ng.IPromise<service.Company> {
      var deferred = this.$q.defer();

      var Parse = window['Parse']

      var Company = Parse.Object.extend("Company");
      var query = new Parse.Query(Company);
      query.equalTo("name", name);
      query.equalTo("creator", email);

      query.find({
        success: (results) => {
          debugger
          var companies: Company[] = results.map((res) => { return this.fromParse(res) });

          var company = companies.length > 0 ? companies[0] : null
          deferred.resolve(company);
        },
        error: (error) => {
          debugger
          deferred.reject(error);
        }
      });

      return deferred.promise
    }

    create(name: string, creatorEmail: string): ng.IPromise<service.Company> {
      var deferred = this.$q.defer();

      var Parse = window['Parse']
      var Company = Parse.Object.extend("Company");

      var company = new Company();
      company.set("name", name);
      company.set("creator", creatorEmail);

      var acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(false);
      company.setACL(acl)

      company.save(null, {
        success: (results) => {
          debugger
          var createdCompany = this.fromParse(results);
          deferred.resolve(createdCompany);
        }, error: (company, error) => {
          debugger
          deferred.reject(error);
        }
      });

      return deferred.promise
    }
  }

  export class Company {
    constructor(public parseId:string, public name: string, public domain: string, public signups: number, public maxSignups: number, public minSignups: number) { }

    specialSignups() {
      if (this.minSignups == null) {
        return this.signups
      } else if (this.signups == 0) {
        return 0;
      } else if (this.signups < this.minSignups) {
        return this.minSignups
      } else {
        return this.signups
      }
      return 200
    }
  }
}
