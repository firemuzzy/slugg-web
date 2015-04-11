/// <reference path="slugg.d.ts" />



interface INeighborhoodStateParams extends ng.ui.IStateParamsService {
  email:string;
  company: string;
  neighborhood:string;
}

class InviteController {
  placeholders:string[] = ["your_friend", "your_colleague", "your_buddy", "your_bff", "your_second_bff", "your_frenemy?", "seriously?", "not to be passive agressive...", "but let's enter a name?"];
  placeholderIndex:number = 0;
  showMail:boolean = true;
  emailFocus:boolean = true;
  emailPlaceholder:string = this.placeholders[this.placeholderIndex];
  userEmail:string;
  company: any;
  neighborhood: any;
  opened: boolean;
  numberOfInvites: number;
  email: string;

  static $inject = ['$timeout', '$stateParams', 'CompanyService', 'Company', 'PersonService', 'NeighborhoodService'];
  constructor(private $timeout:ng.ITimeoutService,
              private $stateParams: INeighborhoodStateParams,
              private CompanyService,
              private Company,
              private PersonService,
              private NeighborhoodService){

    this.userEmail = $stateParams.email;

    this.CompanyService.companyFromEmail($stateParams.email).then((company) => {
      this.company = company;
    }, () => {
      this.Company.promiseFromNameEmail($stateParams.company, $stateParams.email).then((company) => {
        this.company = company;
      });
    });

    this.NeighborhoodService.neighborhoodFromName(this.$stateParams.neighborhood).then( (neighborhood) => {
      this.neighborhood = neighborhood;
    });

    this.$timeout( () => { this.opened = true; }, 400);
  }

  sendEmail(email){
    if(email != null && email.length > 0) {
      this.emailPlaceholder = this.placeholders[0];

      this.PersonService.sendEmail(email, this.company).then( (timesSent) => {
        this.numberOfInvites = timesSent;
        if(timesSent == null){
          this.opened = false;
          this.$timeout(() => {this.showMail = false; }, 1750)
            .then( () => { this.$timeout( () => { this.showMail = true; this.email = null; }, 1000); })
            .then( () => { this.$timeout( () => { this.opened = true; this.emailFocus = true; this.emailPlaceholder = this.placeholders[0];  }, 2500); });
        }

      });
    } else {
      this.emailFocus = true;
      this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholders.length;
      this.emailPlaceholder = this.placeholders[this.placeholderIndex];
    }
  }
}

angular.module('app').controller("InviteController", InviteController);