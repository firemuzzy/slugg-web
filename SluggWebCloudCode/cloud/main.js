
var PROD_ENABLED = true;
var EMAILING_ENABLED = true;

var TEST_MANDRILL_KEY = "nhwncprT1OvJJoxN2NJ5ng"
var PROD_MANDRILL_KEY = "jq_ErQOwhNXJWO0ucvYFAg"

var MANDRILL_KEY = PROD_ENABLED ? PROD_MANDRILL_KEY : TEST_MANDRILL_KEY;


Parse.Cloud.beforeSave("Company", function(request, response) {
  if(request.object.get("verified") === true && !request.master) {
    response.error("may not mark the company as verified");
  } else {
    response.success();
  }
});

function sendInviteCoworkerEmail(email, companyName) {
  if(!EMAILING_ENABLED) {
    console.error("sendInviteCoworkerEmail - not sending email to:"+email+" company:"+companyName+" emailing is disabled");
    return;
  }

  var Mandrill = require('mandrill');
  Mandrill.initialize(MANDRILL_KEY);

  console.log("sendInviteCoworkerEmail - sending coworker invite email to:" + email + " company:" + companyName);
  Mandrill.sendTemplate({
    "template_name": "slugg-recruit-coworker", 
    "template_content": [],
    "message": {
      "merge_language": "handlebars",
      "global_merge_vars": [ { "name": "companyName", "content": companyName} ],
      to: [ { email: email } ]
    },
    async: true
  },{
    success: function(httpResponse) {
      console.log(httpResponse);
      console.log("sendInviteCoworkerEmail - invite coworker sent to:" + email + " company:" + companyName);
      response.success();
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      console.error("sendInviteCoworkerEmail - could not send invite coworker email to:" + email + " company:" + companyName + " error:" + error.message);
      response.error("Uh oh");
    }
  });
}

// Validate the invite object
Parse.Cloud.beforeSave("Invite", function(request, response) {
  if (!request.object.get("inviter")) {
    response.error("inviter is required for signup");
  } else if (!request.object.get("invitee")) {
    response.error("invitee is required for signup");
  } else if (!request.object.get("company")) {
    response.error("company is required for signup");
  } else {
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query("Invite");
    var invitee = request.object.get("invitee")
    console.log("beforeSave('Invite') - Searching for invitee for email " + invitee);

    query.equalTo("invitee", invitee);
    query.first({
      success: function(object) {
        if (object) {
          console.error("beforeSave('Invite') - Invite object already exists for invitee " + invitee)
          response.error("The provided email was already invited");
        } else {
          console.log("beforeSave('Invite') - did not find any Invite object for invitee " + invitee)
          response.success();
        }
      },
      error: function(error) {
        console.error("beforeSave('Invite') - could not validate uniqueness for this Invite object: " + error);
        response.error("Could not validate uniqueness for this Invite object.");
      }
    });
  }
});

// Send and invite to a new user
Parse.Cloud.afterSave("Invite", function(request) {
  var inviterEmail = request.object.get("inviter");
  var inviteeEmail = request.object.get("invitee");
  var companyName = request.object.get("companyName");

  sendInviteCoworkerEmail(inviteeEmail, companyName);
});

function sendThanksForSigningUpEmail(email, companyName) {
  if(!EMAILING_ENABLED) {
    console.error("sendThanksForSigningUpEmail - not sending email to:"+email+" company:"+companyName+" emailing is disabled");
    return;
  }

  var Mandrill = require('mandrill');
  Mandrill.initialize(MANDRILL_KEY);

  console.log("sendThanksForSigningUpEmail - sending email to:" + email + " company:" + companyName);
  Mandrill.sendTemplate({
    "template_name": "slugg-thanks-for-signing-up", 
    "template_content": [],
    "message": {
      "merge_language": "handlebars",
      "global_merge_vars": [ { "name": "companyName", "content": companyName} ],
      to: [ { email: email } ]
    },
    async: true
  },{
    success: function(httpResponse) {
      console.log("sendThanksForSigningUpEmail - thanks for signup email sent to:" + email + " company:" + companyName);
      response.success("Thanks for signing up sent to " + email);
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      console.error("sendThanksForSigningUpEmail - could not sent thanks for signing up email to:" + email + " company:" + companyName + " error:" + error.message);
      response.error("Uh oh");
    }
  });
}

// make the company, neighborhood, email fields required
Parse.Cloud.beforeSave("Signup", function(request, response) {
  if (!request.object.get("company") || request.object.get("company").length == 0 ) {
    response.error("company is required for signup");
  } else if (!request.object.get("neighborhood") || request.object.get("neighborhood").length == 0 ) {
    response.error("neighborhood is required for signup");
  } else if (!request.object.get("email") || request.object.get("email").length == 0 ) {
    response.error("email is required for signup");
  } else {
    response.success();
  }
});

Parse.Cloud.afterSave("Signup", function(request) {
  console.log("afterSave('Signup') - calling after save for Signup to companyId:" + request.object.get("company").id);

  var currentEmail = request.object.get("email");

  var signupQuery = new Parse.Query("Signup");
  signupQuery.equalTo("email", currentEmail);
  signupQuery.count({
    success: function(count) {
      query = new Parse.Query("Company");
      query.get(request.object.get("company").id, {
        success: function(company) {
          var companyName = company.get("name");
          sendThanksForSigningUpEmail(currentEmail, companyName);

          // only increment the count if there is at most only 1 signup with the provided email
          // that one being the one we just inserted
          if(count <= 1) {
            Parse.Cloud.useMasterKey();

            console.log("afterSave('Signup') - Incrementing company " + companyName)
            company.increment("signups");
            company.save();
          }
        },
        error: function(error) {
          console.error("afterSave('Signup') - could not find company, error " + error.code + " : " + error.message);
        }
      });

    },
    error: function(error) {
      console.error("afterSave('Signup') - Got an error counting signups for " + currentEmail + ", error " + error.code + " : " + error.message);
    }
  });
});

Parse.Cloud.afterDelete("Signup", function(request) {
  var currentEmail = request.object.get("email")
  var signupQuery = new Parse.Query("Signup");
  signupQuery.equalTo("email", currentEmail);

  signupQuery.conut({
    success: function(count) {
      // only decrement the count if there are no more signups left with the provided email
      if(count <= 0) {
        query = new Parse.Query("Company");
        query.get(request.object.get("company").id, {
          success: function(company) {

            // only decrement is the signups count is larger thatn 0
            var signups = parseInt(company.get("signups"))
            if(signups > 0) {
              Parse.Cloud.useMasterKey();

              console.log("afterDelete('Signup') - Decrementing company " + company.get("name"))
              company.increment("signups", -1);
              company.save();
            }
          },
          error: function(error) {
            console.error("afterDelete('Signup') - Got an error " + error.code + " : " + error.message);
          }
        });
      }

    },
    error: function(error) {
      console.error("afterDelete('Signup') - Got an error counting signups for " + currentEmail + ", error " + error.code + " : " + error.message);
    }
  });

});