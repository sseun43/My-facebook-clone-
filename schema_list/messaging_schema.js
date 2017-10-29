var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var messaging= new Schema({
	id:Schema.Types.ObjectId,
	participants:[{type:Schema.Types.ObjectId,ref:"Person"}],
	messages:[String]
	
});

module.exports=messaging;