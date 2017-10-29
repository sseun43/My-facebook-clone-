var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var messages=require("./messaging_schema.js");
var bcrypt=require("bcrypt");
var saltFactor=10;

var personSchema= new Schema({
	id:Schema.Types.ObjectId,
	name:{type:String, required:true},
	age:{type:Number, required:true},
	email:{type:String, required:true,unique:true},
	password:{type:String, required:true},
	profilePicture:{type:String, default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"},
	status:[String],
	friendRequest:[{type:Schema.Types.ObjectId,ref:"Person"}],
	friendList:[{type:Schema.Types.ObjectId,ref:"Person"}],
	messaging:[messages]

	

})



var noop= function(){}

personSchema.pre("save",function(done){
	//console.log(messages);
	var user=this;
	if(!user.isModified("password")){
		return done();
	}
bcrypt.genSalt(saltFactor, function(err, salt) {
	if(err){return done(err)}
    bcrypt.hash(user.password, salt, function(err, hash) {
        user.password=hash;
        done();
    	})
	})
})

personSchema.methods.checkPassword=function(guess,callback){
	bcrypt.compare(guess, this.password, function(err, res) {
		callback(err,res)

	})

};

personSchema.methods.returnName=function(){
	return this.name;
}


var Person=mongoose.model('Person',personSchema);

module.exports=Person