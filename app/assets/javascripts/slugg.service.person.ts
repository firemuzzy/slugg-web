/// <reference path="./slugg.d.ts" />

module slugg.service {
  export class PersonService {
    static $inject = ['$q'];
    constructor(private $q: ng.IQService) { }
    emailsSent = {}

    sendEmail(email: string, company) {
        var key = email + company.domain;
        if (this.emailsSent[key] == null) {
            this.emailsSent[key] = 1;
            return this.$q.when(null);
        } else {
            this.emailsSent[key] += 1;
            return this.$q.when(this.emailsSent[key]);
        }
    }
  }
}