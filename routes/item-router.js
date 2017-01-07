var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var item = require('../model/item-model.js');
var multer = require("multer");
var path = require('path')
var fs = require('fs');
var maxSize = 4 * 1024 * 1024; //4MB
var allowedExts= [".png", ".PNG", ".jpg", ".jpeg", ".JPG", ".JPEG"];

var itemRouter = express.Router();
itemRouter.use(bodyParser.json());

var dir = './uploads/images/items';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
  }
});

//Multiple Image upload
var upload = multer({
	storage : storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb) {
    if (allowedExts.indexOf(path.extname(file.originalname)) <= -1) {
      return cb(new Error('Only images are allowed'))
    }
    cb(null, true)
  }
}).array('banner',5);

itemRouter.route('/')
.get(function(req,res){
	item.find({}, function(err, item){
		if(err){
			return fails(err,res);
		} else{
			successGet(res,item);
		}
    	res.end();
		//200, application/json
	});
})
.post(function(req, res,next){
	upload(req, res, function (err) {
			if (err) {
			     // An error occurred when uploading
				return fails(res,err);
			} else{
				// Everything went fine
        var imageUrlJsonArr = [];
        var offerJsonArr = [];
        if(req.body.offers!==null || req.body.offers!=='undefined' ||req.body.offers!==''||req.body.offers.indexOf('undefined') !== -1){
          offerJsonArr = offerJsonArr.concat(JSON.parse(req.body.offers));
        }
        console.log(offerJsonArr);
        if(req.files === null || req.files.length <= 0){
            addItem(req.body.categoryId,req.body.name,imageUrlJsonArr,req.body.description,offerJsonArr, res);
        } else{
          for(count = 0; count < req.files.length; count++){
            imageUrlJsonArr.push({
              url: req.files[count].path
            });
          }
          addItem(req.body.categoryId,req.body.name,imageUrlJsonArr,req.body.description,offerJsonArr, res);
        }

			}
    });
})
.delete(function(req,res,next){
	item.remove({}, function(err, response){
		if(err){
			// An error occurred
			return fails(res, err);
		} else{
			success(res,response);
		}
	});
});

itemRouter.route('/:cid/:itemId')
.get(function(req,res,next){
	item.find({ "categoryId": req.params.cid, "_id":req.params.itemId}, function(err, item){
			if(err){
				// An error occurred
				return fails(res, err);
			} else{
				successGet(res,item);
			}
		//200, application/json
	});
})
.delete(function(req, res, next){
	item.findOneAndRemove({ "categoryId": req.params.cid, "_id":req.params.itemId}, function(err, response){
		if(err){
				// An error occurred
				return fails(res, err);
			} else{
				success(res,response);
			}
	});
});

itemRouter.route('/update/:cid/:itemId')
.post(function(req, res, next){
  upload(req, res, function (err) {
			if (err) {
			     // An error occurred when uploading
				return fails(res,err);
			} else{
				// Everything went fine
        var imageUrlJsonArr = [];
        var offerJsonArr = [];
        if(req.body.offers!==null || req.body.offers!=='undefined' ||req.body.offers!==''||req.body.offers.indexOf('undefined') !== -1){
          offerJsonArr = offerJsonArr.concat(JSON.parse(req.body.offers));
        }
        if(req.files === null || req.files.length <= 0){
            updateItem(req.body.itemId,req.body.categoryId,req.body.name,imageUrlJsonArr,req.body.description,offerJsonArr, res);
        } else{
          for(count = 0; count < req.files.length; count++){
            imageUrlJsonArr.push({
              url: req.files[count].path
            });
          }
          updateItem(req.body.itemId,req.body.categoryId,req.body.name,imageUrlJsonArr,req.body.description,offerJsonArr, res);
        }

			}
    });
});

/*
 * Usable functions
*/

function addItem(cid, name, urls, description, offers, res) {
		item.create(((urls.length>0)?{"categoryId":cid,"name":name,"banner":urls,"description":description,"offers":offers}:{"categoryId":cid,"name":name,"description":description,"offers":offers})
    , function(err, data){
		if(err){
			 if (err.name === 'MongoError' && err.code === 11000) {
				// Duplicate category insertion
				return fails('Item already exist!', res);
			 }
			return fails(res, err);
		} else{
			success(res, data);
		}
		res.end();
	});
}

function updateItem(itemid, cid, name, urls, description, offers, res){
		item.findByIdAndUpdate(itemid,{$set: ((urls.length>0)?{"categoryId":cid,"name":name,"banner":urls,"description":description,"offers":offers}:{"categoryId":cid,"name":name,"description":description,"offers":offers})},
		{new : true},function(err, category){
			if(err){
				// An error occurred
				return fails(res, err);
			} else{
				success(res,category);
			}

	});
}

function successGet(res, data){
		if(data === null || data[0] === null || data[0] === 'undefined'){
			fails(res, "No item available")
		} else{
		res.json({
				success: true,
				message: "",
				data: data
			});
		}
}

function success(res, data){
		if(data === null){
			fails(res, "No item available")
		} else{
		res.json({
				success: true,
				message: "",
				data: data
			});
		}
}

function fails(res, err){
	return res.status(500).send({ succes: false, message: err });
}
module.exports = itemRouter;
