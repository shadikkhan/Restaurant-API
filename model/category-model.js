var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categoryModel = new Schema({
		name: {
			type:String,
			require:true,
			unique:true
		},
		banner: {
			type:String,
			require:false
		},
		description: {
			type:String,
			require:false
		}
		}, 
		{
			timestamps:true //Add two field automatically, createAt, updateAt
		});
var Category = mongoose.model("category" ,categoryModel);
module.exports = Category;
