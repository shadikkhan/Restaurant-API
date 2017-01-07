var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Banners = new Schema({
    url     : String
});

var Offers = new Schema({
    offerTitle     : String,
    offerDescription  : String
});

var itemModel = new Schema({
		categoryId: {
			type:String,
			require:true
		},
		name: {
			type:String,
			require:true,
			unique:true
		},
		description: {
			type:String,
			require:true
		},
		banner: [Banners],
		offers: [Offers]
		},
		{
			timestamps:true //Add two field automatically, createAt, updateAt
		});
var Item = mongoose.model("items" ,itemModel);
module.exports = Item;
