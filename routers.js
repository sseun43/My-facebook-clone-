var express=require('express')
var router=express.Router();
var passport=require("passport")
var Person=require("./schema_list/person_schema.js")
var uuidv1 = require('uuid/v1');

//var io = require("./app.js")

var parsestring=function(str){
	        return str.split(",");
	    }

	var loggedInSecurity=function(req,res,next){ // logged in security make sure that a user is logged in b4 certain routings are perfomed
		if(req.isAuthenticated()){ // built in function from passport to check if a user is authenticated
			return next()
		}else{
			console.log("nobody is logged in")
			res.redirect("/login")
		}
	}

	var reformArray=function(theArr,req,res){
		
		var arr=[]
		theArr.forEach(function(v,i,a){
			Person.findById(v)
			.select({name:1,_id:1,status:1})
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
	router.get('/',function(req,res){
		res.json({response:"Welcome to my social network API"})
	})
	router.post('/new',function(req,res){ 
	   var personInstance=new Person({
			name:req.body.name,
			age:req.body.age,
			password:req.body.password,
			email:req.body.email,
			profilePicture:req.body.profilePicture

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

	router.get('/list',loggedInSecurity,function(req,res){
		Person.find()
		.select({name:1,_id:1})
		.exec(function(err,result){
			if(err){console.log(err)}
				else{
					
					res.json({list:result})
				}
		})
	})//the list of the whole status with their profile pictures and name only

	router.get('/login',function(req,res){
		res.json({error:"pls login"})
	})

	router.post('/login',passport.authenticate("local",{
		//session:false, // Use this for making sure that the session ends after every call
		failureRedirect: "/login"
	}),
	function(req,res){
		res.redirect("/myprofile")
	})

	// for login into the 
	router.get('/goto',loggedInSecurity, function(req,res){
		
		res.end("session is logged")
	})// for viewing the whole of another persons profile

	router.get('/myprofile',function(req,res){
		res.json({success:"success",user:req.user})//({user:req.user})// passport populate req.user for us
	}) //show the ur whole profile


	router.post('/mystatus',loggedInSecurity,function(req,res){
		req.user.status.push(req.user.name+" : "+req.body.status)
		req.user.save(function(err){ //possible to save to the Mongo by just calling save because passport is using mongoose static method Findone
			if(err){
				res.json({error:err})
			}else{
			res.json({response:"status saved"})
			}
	})
	}) // create ur own new status

	router.get('/allstatus',loggedInSecurity,function(req,res){
		Person.find()
		.select({name:1,status:1,_id:1})
		.exec(function(err,result){
			if(err){
				res.json({error:err})
			}else{
				res.json({statuses:result})
			}
		})
	})// show every public status

	router.get('/sendRequest/:friend',loggedInSecurity,function(req,res){
		Person.findOne({name:req.params.friend})
		.exec(function(err,result){
			console.log(result);
			if(err){
				return res.json({error:err})
			}else{
				if(result.friendRequest.indexOf(req.user._id)!==-1){
					return res.json({error:"friend request already sent"})
				}
				if(result.friendList.indexOf(req.user._id)!==-1){
					res.json({error:"you are already friends"})
				}else{
				result.friendRequest.push(req.user._id)
				result.save(function(err){
					if(err){
					return res.json({error:err})
					}else{
						res.json({response:"friend request sent"})
					}
				})
					}

			}
		})
	})//send friend request

	router.get('/myfriends',loggedInSecurity,function(req,res){
		if(req.user.friendList.length===0){
			res.json({error:"empty"})
		}else{
			reformArray(req.user.friendList,req,res);
		}
	})// get a list of all ur friends

	router.get('/viewmyrequest',loggedInSecurity,function(req,res){
		if(req.user.friendRequest.length===0){
			res.json({error:"no friendRequest"})
		}else{
			reformArray(req.user.friendRequest,req,res)
		}
	}) // view my friend request list

	router.get('/acceptrequest/:friend',loggedInSecurity,function(req,res){
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
					result.friendList.push(result.friendRequest[index])
					Person.findById(req.params.friend)
					.exec(function(err,result2){
						if(err){
							console.log("could not find friend")
						}else{
							result2.friendList.push(req.user._id)
							result2.save();
						}
					})
					result.friendRequest.splice(index,1)
					result.save(function(err){
						if(err){
							res.json({error:err})
						}else{
							res.json({response:"friendRequest accepted"})
						}
					})
				}
				})
			}else{
				return res.json({error:"friend not on list"})
			}
		}
	}) //used to accept friend request
	router.get('/rejectrequest/:friend',loggedInSecurity,function(req,res){
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

	router.get('/removefriend/:friend/',loggedInSecurity,function(req,res){
		if(req.user.friendList.length===0){
			res.json({error:"no friends"})
		}else{
			var index=req.user.friendList.indexOf(req.params.friend);
			if(index > -1){
				Person.findById(req.user._id)
				.exec(function(err,result){
					if(err){
						return res.json({error:err})
					}else{
					Person.findById(req.params.friend)
					.exec(function(err,result2){
						if(err){
							return res.json({error:err})
						}else{
							var index2=result2.friendList.indexOf(req.user._id)
							result2.friendList.splice(index2,1)
							result2.save()
						}
					})		
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
	router.get("/allmessages",loggedInSecurity,function(req,res){
		Person.findById(req.user._id)
		.select({messaging:1,_id:0})
		.populate("messaging.participants","name _id")
		.exec(function(err,result){
			if(err){
				res.json({error:err})
			}else{
				res.json(result)
			}

		})
		
		
	})
	router.post('/createmessage/:friend',loggedInSecurity, function(req,res){
			var daUniqueId = uuidv1()
		if(req.user.friendList.indexOf(req.params.friend)===-1){
			return res.json({error:"you are not friends"})
		}
		//var formattedObj=req.body.messageObj.messages.push(req.body.message)
		var theFriends=parsestring(req.params.friend); // put also case where there is no parameter
		Person.findById(req.user._id)
		.exec(function(err,result){
			if(err){
				return res.json({error:err})
			}else{
				var doc=result.messaging.id(req.body.messageId)
					
				if(doc){ 
					console.log("we have doc")
					//result.messaging.id(req.body.messageId).remove() /// delete old documment
					//result.messaging.push(formattedObj) /// replace it with new document
					doc.messages.push(req.user.name+" : "+req.body.message)
					Person.findById(req.params.friend)
						.exec(function(err,friendResult){ 
							if(err){
								return res.json({error:err})
							}else{
								var friendDoc=friendResult.messaging.id(req.body.messageId)
								friendDoc.messages.push(req.user.name+" : "+req.body.message);
								friendResult.save(function(err,result){
									if(err){
										return res.json({error:err})
									}else{
										console.log("first stage saved")
									}
								})
							}
						})
				}else{ 
					console.log(req.body.message)
					result.messaging.push({ 
						_id:daUniqueId,
						participants:theFriends,
						messages:[req.user.name+" : "+req.body.message]
					})

					Person.findById(req.params.friend)
					.exec(function(err,friendResult){
						if(err){
							return res.json({error:err});
						}else{
							friendResult.messaging.push({
								_id:daUniqueId,
								participants:[req.user._id],// fix this to include friends in group 2
								messages:[req.user.name+" : "+req.body.message]
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
							
						req.app.io.emit('message', "message");	
						return res.json({response:"properly saved"})
							}
								})

						}
					})
				
			})


	router.get('/logout',loggedInSecurity,function(req,res){
		req.logout()
		res.json({response:"user logged out"})
	})

	module.exports=router