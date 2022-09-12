var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose")

var userSchema = new mongoose.Schema({
	username: String,
	email : String ,
	password : String
});



userSchema.plugin(passportLocalMongoose, {usernameQueryFields: ["email"]});//this add all functionality come with 

module.exports = mongoose.model("user", userSchema);