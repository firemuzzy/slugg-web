
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

Parse.Cloud.afterSave("Signup", function(request) {
  query = new Parse.Query("Company");
  query.get(request.object.get("company").id, {
    success: function(company) {
      post.increment("signups");
      post.save();
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});

Parse.Cloud.afterDelete("Signup", function(request) {
  query = new Parse.Query("Company");
  query.equalTo("company", request.object.id);
  query.find({
    success: function(company) {
      post.decrement("signups");
      post.save();
    },
    error: function(error) {
      console.error("Error finding related comments " + error.code + ": " + error.message);
    }
  });
});