var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var JSAlert = require("js-alert");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
var path = require("path");
var multer = require("multer");
var User = require("./models/user.js");
var favicon = require('serve-favicon');
var app = express();
const port = process.env.PORT || 3636;

//connecting Database
mongoose.connect("mongodb://localhost/xapjamDB",{useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect("mongodb+srv://mandeepjain:8982152230@cluster0.woay3rs.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true });

// Comment Schema
var commentSchema = mongoose.Schema({
	name: String,
	comment:String,
});
var comment = mongoose.model("comment", commentSchema);
// --------------------------------------------------------------------------------------
//blog Schema and model it up
// --------------------------------------------------------------------------------------
var blogSchema = mongoose.Schema({
	title: String,
	img: String,
	tags: String,
	desc: String,
	comment: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "comment"
				}
			],
	author: String,
	created_at: { type: Date, required: true, default: Date.now }
});
var blog = mongoose.model("blog",blogSchema);
// --------------------------------------------------------------------------------------


//Multer Config 
//use to upload images 
// --------------------------------------------------------------------------------------
// SET STORAGE
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
    cb(null,'./public/uploads')
  },
  filename: function (req, file, cb) {
  cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));  }
});
 //setting storage var for multer
var upload = multer({ storage: storage });

// --------------------------------------------------------------------------------------
app.use(require("express-session")({
	secret: "Xavier Xavier Xavier",
	resave: false,
	saveUninitialized: false
}));

app.set("view engine","ejs");//we dont have to apply ".ejs" 
app.use(express.static("public"));//app look for styleSheets in public dir
app.use(bodyParser.urlencoded({extended: true}));//use for get data from form
app.use(methodOverride("_method"));//use for PUT and DELETE req
app.use(flash());
app.use(passport.initialize());//app to use passport functionality
app.use(passport.session());//login sessions


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//save user object into session n encode it 
passport.deserializeUser(User.deserializeUser());//decode the user save in session and check 


//--------------------------------------------------------------------------------------
//browser icon
//--------------------------------------------------------------------------------------
app.use(favicon('./public/images/title.jfif'));

app.use(function(req, res, next){
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
//--------------------------------------------------------------------------------------
//Cloudinary
//--------------------------------------------------------------------------------------
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
	cloud_name : process.env.CLOUD_NAME,
	api_key : process.env.CLOUDINARY_API_KEY,
	api_secret : process.env.CLOUDINARY_API_SECRET
})

// exports.uploads = (file, folder) => {
// 	return new Promise(resolve => {
// 		cloudinary.uploader.upload(file, (result) =>{
// 			resolve({
// 				url:result.url,
// 				id:result.public_id
// 			})
// 		},{
// 			resource_type: "auto",
// 			folder
// 		})
// 	})
// }
// --------------------------------------------------------------------------------------
//Root Route Main page
// --------------------------------------------------------------------------------------
app.get("/xapjam",function(req,res){
	blog.find({}).sort({'created_at': -1}).exec(function(err,data){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/xapjam");
		}else{
		// console.log(data);
		res.render("index",{blogs:data});
		}
	})	
});
app.get("/",function(req,res){
	res.redirect("/xapjam");
});

// --------------------------------------------------------------------------------------
//blogPost 
// --------------------------------------------------------------------------------------
app.get("/xapjam/blogpost", isLoggedIn, function(req,res){
	res.render("blog form");
});


// --------------------------------------------------------------------------------------
//Route handelling Post form data
// --------------------------------------------------------------------------------------
app.post("/xapjam/blogpost", upload.single("image"), function(req,res){
	console.log("hit here");
	const file = req.file
	console.log(req.file);
  if (!file) {
    req.flash("error", "Please check you image")
    res.redirect("/xapjam");
  }else{
		cloudinary.uploader.upload(file.path,function(err,result){
			if(err) res.redirect("/xapjam");
				var newBlog = {
					title: req.body.title,
					img: result.url,
					tags: req.body.tags,
					desc: req.body.desc,
					author: req.user.username
				};	
			// make this entry in database
			blog.create(newBlog,function(err,data){
				if(err)
				{
					console.log(err);
					req.flash("error","Something went wrong");
					res.redirect("/xapjam");
				}
				else{
					console.log(data);
					req.flash("success", "Blog Posted")
					res.redirect("/xapjam");
				}
			})
		})

		

		}
	});
	
//--------------------------------------------------------------------------------------
// Route About
// --------------------------------------------------------------------------------------
app.get("/xapjam/about", function(req,res){
	res.render("about");
});

// --------------------------------------------------------------------------------------
//Route Campus category
// --------------------------------------------------------------------------------------
app.get("/xapjam/campus", function(req, res){
	blog.find({'tags' : "Campus"}).sort({'created_at': -1}).exec(function(err,blog){

		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/xapjam");
		}else{
			res.render("campus",{blog : blog});
		}
	})
});

// --------------------------------------------------------------------------------------
//Route Events category
// --------------------------------------------------------------------------------------
app.get("/xapjam/events", function(req, res){
	blog.find({'tags' : "Events"}).sort({'created_at': -1}).exec(function(err,blog){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/xapjam");
		}else{
			res.render("events",{blog : blog});
		}
	})
});

// --------------------------------------------------------------------------------------
//Route Foods category
// --------------------------------------------------------------------------------------
app.get("/xapjam/food", function(req, res){
	blog.find({'tags' : "Food"}).sort({'created_at': -1}).exec(function(err,blog){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/xapjam");
		}else{
			res.render("foods",{blog : blog});
		}
	})
});
// --------------------------------------------------------------------------------------
//Route Entertainment category
// --------------------------------------------------------------------------------------
app.get("/xapjam/entertainment", function(req, res){
	blog.find({'tags' : "Entertainment"}).sort({'created_at': -1}).exec(function(err,blog){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/xapjam");
		}else{
			res.render("entertainments",{blog : blog});
		}
	})
});

// --------------------------------------------------------------------------------------
// Route Edit 
// --------------------------------------------------------------------------------------
app.get("/xapjam/:id/edit",isLoggedIn ,function(req,res){
blog.findById(req.params.id, function(err,blog){
	if(err){
		req.flash("error", "Something went wrong");
		console.log("err");
	}else{
	res.render("edit",{blog : blog});	
	}
	})
});
// --------------------------------------------------------------------------------------
// Route Edit handel
// --------------------------------------------------------------------------------------
app.put("/xapjam/:id",isLoggedIn, upload.single("image"), function(req,res){
	const file = req.file
  if (!file) {
	req.flash("error", "Please check you image")
    res.redirect("/xapjam");
  }else{
	console.log(req.body.tags);
	var editBlog = {
		title: req.body.title,
		img: req.file.filename,
		tags: req.body.tags,
		desc: req.body.desc,
	};
	blog.findByIdAndUpdate(req.params.id, editBlog, function(err,data){
		if(err){
			 req.flash("error", "Unable to find blog");
			 res.redirect("/xapjam");
		}else{
			req.flash("success", "Blog Updated")
			res.redirect("/xapjam/"+ req.params.id);
		}
	})
  }
});
// --------------------------------------------------------------------------------------
// Route DELETE
// --------------------------------------------------------------------------------------
app.delete("/xapjam/:id", function(req,res){
	
		
		blog.findByIdAndDelete(req.params.id, function(err){
		if(err){
		req.flash("error", "Something went wrong");
		res.redirect("/xapjam/"+ req.params.id);
		}else{
			req.flash("success", "Blog deleted");
			res.redirect("/xapjam");
		}
		});
	// }else{
		// req.flash("error", "Something went wrong");
		// res.redirect("/xapjam/"+ req.params.id);
	// }
 
});

// --------------------------------------------------------------------------------------
// Route Comment
// --------------------------------------------------------------------------------------
app.post("/xapjam/:id/comment", function(req,res){
	blog.findById(req.params.id, function(err, blog){
		if(err){
		req.flash("error", "Something went wrong");
		res.redirect("/xapjam");
		}else{
			var comnt={
				name: req.body.name,
				comment: req.body.comment
			};
			comment.create(comnt, function(err,comment){
				if(err){
					req.flash("error", "Something went wrong");
					res.redirect("/xapjam");
				}else{
					blog.comment.push(comment);
					blog.save();
					req.flash("success", "Comment Posted");
					res.redirect("/xapjam/"+req.params.id)
				}
			})
		}
	})
});
// --------------------------------------------------------------------------------------
// User Register
// --------------------------------------------------------------------------------------
app.get("/xapjam/users/register", function(req,res){
	res.render("register");
});
	//handel Post Register
app.post("/xapjam/users/register", function(req,res){
	var error = [];
	// Validations
		
		 if (!req.body.username || !req.body.email || !req.body.password || !req.body.confirmPassword) {
				error.push({ msg: 'Please enter all fields' });
			}
		if (req.body.password.length < 6) {
				error.push({ msg: 'Password must be at least 6 characters' });
			}
		if(req.body.password !== req.body.confirmPassword){
				error.push({msg: 'Both password should match'});
			}
		if(error.length > 0){
			for(i=0; i<error.length; i++){
				var x = error[i].msg+" || ";
				req.flash("error", x);
			}
				res.redirect("/xapjam/users/register");
			}else{
		User.findOne({"email": req.body.email},function(err, user){
		if(user){
				req.flash("error", "Email alreay exist ");
				res.redirect("/xapjam/users/register");
		}else{
				User.register({username : req.body.username, email: req.body.email},req.body.password, function(err,user){
				if(err){
					res.redirect("/xapjam/users/register");
				}else{
					passport.authenticate("local")(req,res,function(){
					res.redirect("/xapjam/dashboard");
					})
				}
				});
			}
		});
	}
});

// --------------------------------------------------------------------------------------
// Login
// --------------------------------------------------------------------------------------
app.get("/xapjam/users/login", function(req,res){
	  res.render('login');
});
	// Handle Log In Post
app.post("/xapjam/users/login",passport.authenticate("local", {
	successRedirect: "/xapjam/dashboard",
	failureRedirect: "/xapjam/users/login",
	failureFlash : {  type: 'error', message:'Invalid username or password.' },

}),function(req,res){
	
});
// --------------------------------------------------------------------------------------
// Logout
// --------------------------------------------------------------------------------------
app.get("/xapjam/users/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/xapjam/dashboard");
});


// --------------------------------------------------------------------------------------
//DashBoard
// --------------------------------------------------------------------------------------
app.get("/xapjam/dashboard", function(req,res){
	res.render("dashboard",{currentUser:req.user});
})

// --------------------------------------------------------------------------------------
//Route Show Each Blog in Full
// --------------------------------------------------------------------------------------
app.get("/xapjam/:id",function(req,res){
	//find 1 blog by id add comment in it
	blog.findById(req.params.id).populate('comment').exec(function(err,blog){
		if(err){
			console.log(err);
		}else{
		res.render("show",{blog : blog, currentUser: req.user});	
		}
	})
	
});
// --------------------------------------------------------------------------------------
// MiddleWare login check
// --------------------------------------------------------------------------------------
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "please log in first!");
	res.redirect("/xapjam/users/login");
};
// --------------------------------------------------------------------------------------
// Delete confirm
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
//Server Config
// --------------------------------------------------------------------------------------

app.listen(port, function(){
	console.log(`Xapjam server start on  ${port}`);
});