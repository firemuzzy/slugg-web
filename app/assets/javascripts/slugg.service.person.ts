/// <reference path="./slugg.d.ts" />

module slugg.service {
  export class PersonService {
    static $inject = ['$q'];
    constructor(private $q: ng.IQService) { }
    emailsSent = {}

    sendEmail(email: string, sender:string, company) {
        var key = email + company.domain;
        if (this.emailsSent[key] == null) {
            this.emailsSent[key] = 1;
            return this._sendInviteEmail(email, sender, company)
        } else {
            this.emailsSent[key] += 1;
            return this.$q.when(this.emailsSent[key]);
        }
    }

    private _sendInviteEmail(email: string, senderEmail: string, company: Company) {
        var Parse = window['Parse']
        var Invite = Parse.Object.extend("Invite");
        var Company = Parse.Object.extend("Company");

        var parseCompany = new Company()
        parseCompany.id = company.parseId

        var invite = new Invite();
        invite.set("inviter", senderEmail.toLowerCase());
        invite.set("invitee", email.toLowerCase())
        invite.set("company", parseCompany);

        var acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        invite.setACL(acl)

        var deferred = this.$q.defer();
        invite.save(null, {
            success: (savedInvite) => {
                deferred.resolve(null);
            }, error: (signup, error) => {
                deferred.reject(error.message);
                console.log("things happened: " + error.message)
            }
        });
        return deferred.promise;
    } 
  }
}