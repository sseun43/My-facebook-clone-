	var express=require('express')
	var app=express()
	var mongoose=require("mongoose")
	var cors=require("cors")
	var session=require("express-session")
	var cookieParser=require("cookie-parser")
	var parser=require("body-parser")
	var fileUpload=require("express-fileupload")
	var Person=require("./schema_list/person_schema.js")
	var passport=require("passport")
	var local=require("passport-local")
	var routes=require("./routers.js")
	var key=require("./key.js")


	var mongoDB="mongodb://"+key.username+":"+key.password+"@ds121575.mlab.com:21575/sseun43"
	//mongoose.Promise=global.Promise
	mongoose.connect(mongoDB,{
		useMongoClient:true
	})

	var db=mongoose.connection

	db.once('open',function() {
		console.log('connected to MmngoDB')
	})
	//db.on('error', console.error.bind(console, 'MongoDB connection error:'));// console logs the error

	//MIDDLEWARE
	app.set("port", process.env.PORT || 3000)
	app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
	app.use(cookieParser("TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX"))
	app.use(parser.urlencoded({extended:true}))//body parser
	app.use(parser.json())
	app.use(session({
	secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
	resave: true,
	saveUninitialized: true
	}))

	passport.use(new local.Strategy(
	  function(username, password, done) {
	    Person.findOne({name: username }, function(err, user) { // fix this so that id is not exposed
	    	if (err) { 
	    		return done(err); 
	    	}
	        if (!user) {
	       		 return done(null, false);
	      }
	      user.checkPassword(password,function(err,isMatch){
	      	if(err){
	      		console.log(err)
	      		return done(null,false);
	      	}
	      	if(isMatch){
	      		return done(null,user)
	      	}else
	      	{return done(null,false)
	      	}
	      })
	    })
	  }
	))

	passport.serializeUser(function(user, cb) {
	  cb(null, user._id);
	})

	passport.deserializeUser(function(id, cb) {
	  Person.findById(id, function (err, user) {
	    if (err) {
	    	 return cb(err);
	    	  }
	    cb(null, user);
	  })
	})

	app.use(passport.initialize())
	app.use(passport.session())//---- for perssistent login

	// express session****
	app.use(fileUpload())// express fileupload
	// express own file server for sending profile picture back
	app.use(function(req,res,next){
	res.locals.currentUser=req.user// a middle ware that saves the current user into res.locals object
	next();
	})
	app.use(routes)

	//OPEN FUNCTIONS
	//________________________________________________________________________________________________________________________________
	// use req.logout() to log current user out
	app.listen(app.get("port"))
	

