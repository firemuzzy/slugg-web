/// <reference path="slugg.d.ts" />

interface IInviteStateParams extends ng.ui.IStateParamsService {
  email: string;
  company: string;
  neighborhood: string;
}

module slugg.controller {
  export class InviteController {
    placeholders: string[] = ["your_friend", "your_colleague", "your_buddy", "your_bff", "your_second_bff", "your_frenemy?", "seriously?", "not to be passive agressive...", "but let's enter a name?"];
    placeholderIndex: number = 0;
    showMail: boolean = true;
    emailFocus: boolean = true;
    emailPlaceholder: string = this.placeholders[this.placeholderIndex];
    userEmail: string;
    company: any;
    neighborhood: any;
    opened: boolean;
    numberOfInvites: number;
    email: string;

    static $inject = ['$timeout', '$stateParams', 'Company', 'Person', 'Neighborhood', '$state'];
    constructor(private $timeout: ng.ITimeoutService,
      private $stateParams: IInviteStateParams,
      private Company: service.CompanyService,
      private Person: service.PersonService,
      private Neighborhood: service.NeighborhoodService,
      private $state: ng.ui.IStateService) {

      var email = $stateParams.email;
      this.userEmail = email;

      // this.Company.fromEmail($stateParams.email).then((company) => {
      //   this.company = company;
      // }, () => {
      //     this.Company.fromEmail($stateParams.company).then((company) => {
      //       this.company = company;
      //     });
      //   });

      this.Company.findById($stateParams.company).then((company) => {
        if(company == null) {
          this.redirectToSignupCompany(email)
        } else {
          this.company = company;
        }
      });

      this.Neighborhood.neighborhoodFromName(this.$stateParams.neighborhood).then((neighborhood) => {
        this.neighborhood = neighborhood;
      });

      this.$timeout(() => { this.opened = true; }, 400);
    }

    private redirectToSignupCompany(email: string) {
      this.$state.go("signupCompany", { email: email });
    }

    sendEmail(email) {
      if (email != null && email.length > 0) {
        this.emailPlaceholder = this.placeholders[0];
        var sender = this.$stateParams.email

        this.Person.sendEmail(email, sender, this.company).then((timesSent: number) => {
          this.numberOfInvites = timesSent;
          if (timesSent == null) {
            this.opened = false;
            this.$timeout(() => { this.showMail = false; }, 1750)
              .then(() => { this.$timeout(() => { this.showMail = true; this.email = null; }, 1000); })
              .then(() => { this.$timeout(() => { this.opened = true; this.emailFocus = true; this.emailPlaceholder = this.placeholders[0]; }, 2500); });
          }

        });
      } else {
        this.emailFocus = true;
        this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholders.length;
        this.emailPlaceholder = this.placeholders[this.placeholderIndex];
      }
    }
  }
}