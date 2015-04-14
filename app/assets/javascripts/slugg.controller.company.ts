/// <reference path="./slugg.d.ts" />

interface ICompanyStateParams extends ng.ui.IStateParamsService {
  company: string;
}

module slugg.controller {
  export class CompanyController {
    company: service.Company

    static $inject = ['$stateParams', 'Company'];
    constructor(private $stateParams: ICompanyStateParams, private Company: service.CompanyService) {
      Company.fromName($stateParams.company).then((company) => {
        this.company = company;
      });
    }

  }
}