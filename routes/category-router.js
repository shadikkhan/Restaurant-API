var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var category = require('../model/category-model.js');
var multer = require("multer");
var path = require('path')
var fs = require('fs');
var maxSize = 4 * 1024 * 1024; //4MB
var allowedExts= [".png", ".PNG", ".jpg", ".jpeg", ".JPG", ".JPEG"];

var categoryRouter = express.Router();
categoryRouter.use(bodyParser.json());

var dir = './uploads/images/category';
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

//Single Image upload
var upload = multer({
	storage : storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb) {
    if (allowedExts.indexOf(path.extname(file.originalname)) <= -1) {
      return cb(new Error('Only images are allowed'))
    }
    cb(null, true)
  }
	}).single('banner');

categoryRouter.route('/')
.get(function(req,res){
	category.find({}, function(err, category){
		if(err){
			return fails(res, err);
		} else{
			successGet(res,category);
		}
		//200, application/json
	});
})
.post(function(req, res,next){
	upload(req, res, function(err){
		if(err){
			// An error occurred when uploading
			return fails(res, err);
		} else{
			// Everything went fine
			if(req.file ==- null || req.file === 'undefined'){
				addCategory(req.body.name,'',req.body.description,res);
			} else{
				addCategory(req.body.name,req.file.path,req.body.description,res);
			}
		}
	});
})
.delete(function(req,res,next){
	category.remove({}, function(err, response){
		if(err){
			// An error occurred
			return fails(res, err);
		} else{
			success(res,response);
		}
	});
});

categoryRouter.route('/:cid')
.get(function(req,res,next){
	category.findById(req.params.cid, function(err, category){
			if(err){
				// An error occurred
				return fails(res, err);
			} else{
				successGet(res,category);
			}
		//200, application/json
	});
})
.delete(function(req, res, next){
	category.findOneAndRemove(req.params.cid, function(err, response){
		if(err){
				// An error occurred
				return fails(res, err);
			} else{
				success(res,response);
			}
	});
});

categoryRouter.route('/update/:cid')
.post(function(req, res, next){
	var cid  = req.params.cid;
	upload(req, res, function(err){
		if(err){
			// An error occurred when uploading
			return fails(res,err);
		} else{
			// Everything went fine
			if(req.file === null || req.file === 'undefined'){
				updateCategory(cid,req.body.name,'',req.body.description,res);
			} else{
				updateCategory(cid,req.body.name,req.file.path,req.body.description,res);
			}
		}
	});
});

/*
 * Usable functions
*/
function addCategory(name, url, description, res) {
		category.create({"name":name,"banner":url,"description":description}, function(err, data){
		if(err){
			 if (err.name === 'MongoError' && err.code === 11000) {
				// Duplicate category insertion
				return fails(res, 'Category already exist!');
			 }
			return fails(res, err);
		} else{
			success(res, data);
		}
		res.end();
	})
}

function updateCategory(cid, name, url, description, res){
		category.findByIdAndUpdate(cid,{$set: ((url === '')?{"name":name,"description":description}:{"name":name,"banner":url,"description":description})},
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
			fails(res, "No category available")
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
module.exports = categoryRouter;
