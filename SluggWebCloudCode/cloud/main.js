
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

// make the company, neighborhood, email fields required
Parse.Cloud.beforeSave("Signup", function(request, response) {
  if (!request.object.get("company")) {
    response.error("company is required for signup");
  } else if (!request.object.get("neighborhood")) {
    response.error("neighborhood is required for signup");
  } else if (!request.object.get("email")) {
    response.error("email is required for signup");
  } else {
    response.success();
  }
});

function sendThanksForSigningUpEmail(email, companyName) {
  var Mandrill = require('mandrill');
  Mandrill.initialize('jq_ErQOwhNXJWO0ucvYFAg');

  console.log("sending email to " + email);
  Mandrill.sendTemplate({
    "template_name": "slugg-thanks-for-signing-up", 
    "template_content": [],
    "message": {
      "merge_language": "handlebars",
      "global_merge_vars": [ { "name": "CompanyName", "content": companyName} ],
      to: [ { email: email } ]
    },
    async: true
  },{
    success: function(httpResponse) {
      console.log(httpResponse);
      console.log("Thanks for signing up sent to " + email);
      response.success("Thanks for signing up sent to " + email);
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      console.error("Uh oh, something went wrong while sending thanks to " + email);
      response.error("Uh oh, something went wrong while sending thanks to " + email);
    }
  });
}

function sendRecruitCoworkerEmail(email, companyName) {
  var Mandrill = require('mandrill');
  Mandrill.initialize('jq_ErQOwhNXJWO0ucvYFAg');

  console.log("sending email to " + email);
  Mandrill.sendTemplate({
    "template_name": "slugg-recruit-coworker", 
    "template_content": [],
    "message": {
      "merge_language": "handlebars",
      "global_merge_vars": [ { "name": "CompanyName", "content": companyName} ],
      to: [ { email: email } ]
    },
    async: true
  },{
    success: function(httpResponse) {
      console.log(httpResponse);
      console.log("Recruit coworker sent to " + email);
      response.success("Recruit coworker sent to " + email);
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      console.error("Uh oh, something went wrong while sending recruit coworker to " + email);
      response.error("Uh oh, something went wrong while sending recruit coworker to " + email);
    }
  });
}

Parse.Cloud.afterSave("Signup", function(request) {
  console.log("Calling after save for Signup to " + request.object.get("company").id)

  var currentEmail = request.object.get("email");

  var signupQuery = new Parse.Query("Signup");
  signupQuery.equalTo("email", currentEmail);
  signupQuery.count({
    success: function(count) {
      query = new Parse.Query("Company");
      query.get(request.object.get("company").id, {
        success: function(company) {
          var companyName = company.get("name")
          sendThanksForSigningUpEmail(currentEmail, companyName);

          // only increment the count if there is at most only 1 signup with the provided email
          // that one being the one we just inserted
          if(count <= 1) {
            Parse.Cloud.useMasterKey();

            console.log("Incrementing company " + company.get("name"))
            company.increment("signups");
            company.save();
          }
        },
        error: function(error) {
          console.error("Got an error " + error.code + " : " + error.message);
        }
      });

    },
    error: function(error) {
      console.error("Got an error counting signups for " + currentEmail + ", error " + error.code + " : " + error.message);
    }
  });
});

Parse.Cloud.afterDelete("Signup", function(request) {
  var currentEmail = request.object.get("email")
  var signupQuery = new Parse.Query("Signup");
  signupQuery.equalTo("email", currentEmail);

  signupQuery.count({
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

              console.log("Decrementing company " + company.get("name"))
              company.increment("signups", -1);
              company.save();
            }
          },
          error: function(error) {
            console.error("Got an error " + error.code + " : " + error.message);
          }
        });
      }

    },
    error: function(error) {
      console.error("Got an error counting signups for " + currentEmail + ", error " + error.code + " : " + error.message);
    }
  });

});