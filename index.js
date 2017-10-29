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


	var mongoDB="mongodb://myusername:mypassword@ds121575.mlab.com:21575/sseun43"// i have edited it to hide my database password
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
	app.use(cors())
	app.use(cookieParser())
	app.use(parser.urlencoded({extended:false}))//body parser
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

	//OPEN FUNCTIONS
	//________________________________________________________________________________________________________________________________
	var parsestring=function(str){
	        return str.split(",");
	    }

	var loggedInSecurity=function(req,res,next){ // logged in security make sure that a user is logged in b4 certain routings are perfomed
		if(req.isAuthenticated()){ // built in function from passport to check if a user is authenticated
			next()
		}else{
			console.log("nobody is logged in")
			res.redirect("/login")
		}
	}

	var reformArray=function(theArr,req,res){
		
		var arr=[]
		theArr.forEach(function(v,i,a){
			Person.findById(v)
			.select({name:1,_id:1})
			.exec(function(err,result){
				if(err){
					res.json({error:err})
				}else{
					arr.push(result)
					if(i===a.length-1){
					res.json(arr)
					}
				}
			})
		})	
	 }



	//__________________________________________________________________________________________________________________________________________
	//ROUTES 
	app.post('/new',function(req,res){ 
	   var personInstance=new Person({
			name:req.body.name,
			age:req.body.age,
			password:req.body.password,
			email:req.body.email

		})
		personInstance.save(function(err){
			if(err){
				console.log(err);
				res.json({error:err})
			}else{
				res.json({response:"saved"})
			}
	   })
	 })

	app.get('/list',loggedInSecurity,function(req,res){
		Person.find()
		.select({name:1,_id:0})
		.exec(function(err,result){
			if(err){console.log(err)}
				else{
					
					res.json({list:result})
				}
		})
	})//the list of the whole status with their profile pictures and name only

	app.get('/login',function(req,res){
		res.json({error:"pls login"})
	})

	app.post('/login',passport.authenticate("local",{
		//session:false, // Use this for making sure that the session ends after every call
		failureRedirect: "/login"
	}),
	function(req,res){
		res.redirect("/myprofile")
	})

	// for login into the 
	app.get('/goto',loggedInSecurity, function(req,res){
		
		res.end("session is logged")
	})// for viewing the whole of another persons profile

	app.get('/myprofile',function(req,res){
		res.json({user:req.user})// passport populate req.user for us
	}) //show the ur whole profile


	app.post('/mystatus',loggedInSecurity,function(req,res){
		req.user.status.push(req.body.status)
		req.user.save(function(err){ //possible to save to the Mongo by just calling save because passport is using mongoose static method Findone
			if(err){
				res.json({error:err})
			}else{
			res.json({response:"status saved"})
			}
	})
	}) // create ur own new status

	app.get('/allstatus',loggedInSecurity,function(req,res){
		Person.find()
		.select({name:1,status:1,_id:0})
		.exec(function(err,result){
			if(err){
				res.json({error:err})
			}else{
				res.json({statuses:result})
			}
		})
	})// show every public status

	app.get('/sendRequest/:friend',loggedInSecurity,function(req,res){
		Person.findOne({name:req.params.friend})
		.exec(function(err,result){
			console.log(result);
			if(err){
				res.json({error:err})
			}else{
				if(result.friendRequest.indexOf(req.user._id)!==-1){
					res.json({error:"friend request already sent"})
				}
				if(result.friendList.indexOf(req.user._id)!==-1){
					res.json({error:"you are already friends"})
				}else{
				result.friendRequest.push(req.user._id)
				result.save(function(err){
					if(err){
					res.json({error:err})
					}else{
						res.json({response:"friend request sent"})
					}
				})
					}

			}
		})
	})//send friend request

	app.get('/myfriends',loggedInSecurity,function(req,res){
		if(req.user.friendList.length===0){
			res.json({error:"empty"})
		}else{
			reformArray(req.user.friendList,req,res);
		}
	})// get a list of all ur friends

	app.get('/viewmyrequest',loggedInSecurity,function(req,res){
		if(req.user.friendRequest.length===0){
			res.json({error:"no friendRequest"})
		}else{
			reformArray(req.user.friendRequest,req,res)
		}
	}) // view my friend request list

	app.get('/acceptrequest/:friend',loggedInSecurity,function(req,res){
		if(req.user.friendRequest.length===0){
			res.json({error:"no friendRequest"})
		}else{
			var index=req.user.friendRequest.indexOf(req.params.friend);
			if(index > -1){
				Person.findById(req.user._id)
				.exec(function(err,result){
					if(err){
						res.json({error:err})
					}else{
					console.log(result.friendRequest);
					result.friendList.push(result.friendRequest[index])
					result.friendRequest.splice(index,1);
					result.save(function(err){
						if(err){
							res.json({error:err})
						}else{
							res.json({response:"friendRequest accepted"})
						}
					})
				}
				})
			}
		}
	}) //used to accept friend request
	app.get('/rejectrequest/:friend',loggedInSecurity,function(req,res){
		if(req.user.friendRequest.length===0){
			res.json({error:"no friendRequest"})
		}else{
			var index=req.user.friendRequest.indexOf(req.params.friend);
			if(index > -1){
				Person.findById(req.user._id)
				.exec(function(err,result){
					if(err){
						res.json({error:err})
					}else{
					result.friendRequest.splice(index,1);
					result.save(function(err){
						if(err){
							res.json({error:err})
						}else{
							res.json({response:"friendRequest rejected"})
						}
					})
				}
				})
			}
		}
	}) //used to reject friend request
	app.get('/removefriend/:friend/',loggedInSecurity,function(req,res){
		if(req.user.friendList.length===0){
			res.json({error:"no friends"})
		}else{
			var index=req.user.friendList.indexOf(req.params.friend);
			if(index > -1){
				Person.findById(req.user._id)
				.exec(function(err,result){
					if(err){
						res.json({error:err})
					}else{
					result.friendList.splice(index,1);
					result.save(function(err){
						if(err){
							res.json({error:err})
						}else{
							res.json({response:"friendRemoved"})
						}
					})
				}
				})
			}
		}
	})// used to remove friend from friend list
	app.get("/allmessages",loggedInSecurity,function(req,res){
		
		res.json(req.user.messaging);// use populate for the members 
	})
	app.post('/createmessage/:friend',loggedInSecurity, function(req,res){
		
		var theFriends=parsestring(req.params.friend); // put also case where there is no parameter
		Person.findById(req.user._id)
		.exec(function(err,result){
			if(err){
				res.json({error:err})
			}else{
				var doc=result.messaging.id(req.body.messageId)
				if(doc){ 
					console.log("we have doc")
					doc.messages.push(req.body.message)
					Person.findById(req.params.friend)
					.exec(function(err,friendResult){
						if(err){
							res.json({error:err})
						}else{
							var friendDoc=friendResult.messaging.filter(function(v){
								return v.participants[0]=req.user._id
							}).pop()
							friendDoc.messages.push(req.body.message);
						friendResult.save(function(err,result){
							if(err){
								res.json({error:err})
							}else{
								res.json({response:"properly saved"})
							}
						})
						}
					})
				}else{ 
					console.log(req.body.message)
					result.messaging.push({ 
						participants:theFriends,
						messages:[req.body.message]
					})

					Person.findById(req.params.friend)
					.exec(function(err,friendResult){
						if(err){
							res.json({error:err});
						}else{
							friendResult.messaging.push({
								participants:[req.user._id],// fix this to include friends in group 2
								messages:[req.body.message]
							})
							friendResult.save(function(err,result){
								if(err){
									console.log(err)
								}else{
									console.log("saved in friend as well")

								}
							})
						}
					})
							
				}
					result.save(function(err,result){
						if(err){
							console.log(err)
						}else{
							console.log("participants saved")
							res.json({response:"properly saved"})
							}
								})

						}
					})
				
			})


	app.get('/logout',function(req,res){
		req.logout()
	})// use req.logout() to log current user out

	app.listen(3000)


