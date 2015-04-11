/// <reference path="./slugg.d.ts" />

class CompanyProvider {
  static $inject = ['$q'];
  constructor(public $q: ng.IQService) {
    model.Company.$q = $q;
    return model.Company;
  }
}

module model {
  export function CompanyProvider($q) {
    return model.Company
  }

  export class Company {
    static $q: ng.IQService;
    static test: ng.IQService;

    constructor(private name: string, private domain: string, private signups: number, private maxSignups: number) { }

    public static promiseFrom (data:any):ng.IPromise<any> {
      if (data instanceof Company) return Company.$q.when(data);
      else if (angular.isArray(data)) return Company.$q.all(data.map(Company.promiseFrom));
      else if (angular.isObject(data) &&
          angular.isString(data.name) &&
          angular.isString(data.domain) &&
          (angular.isString(data.signups) || angular.isNumber(data.signups)) &&
          (angular.isString(data.maxSignups) || angular.isNumber(data.maxSignups))) {
          return Company.$q.when(new Company(data.name, data.domain, parseInt(data.signups), parseInt(data.maxSignups) ));
      }
      else return Company.$q.reject("data can't be parsed correctly");
    }
    public static promiseFromName(name: string): ng.IPromise<any> {
      var data = { name: name, domain: "", signups:0, maxSignups:0}
      return Company.promiseFrom(data);
    }
  }
}
angular.module('app.models.company', []).factory("Company", CompanyProvider);
// angular.module('app.models.company', []).factory("Company2", model.CompanyProvider);
model.CompanyProvider.$inject = ['$q']
