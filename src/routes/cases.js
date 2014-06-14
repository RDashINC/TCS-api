var express = require('express');
var router = express.Router();
var mysql      = require('mysql');
var connection = require('../config/database');

function getMysqlTimeNow() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

router.use(function(req, res, next) {
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	next();
});

/* Base get, throws error. */
router.get('/', function(req, res) {
	res.send("{\"error\":\"no 'action'\"}");
});

router.get('/get/:id', function(req, res) {
	var id = req.param('id');
	var query = '';
	if(id==="all") {
		query = connection.query('SELECT * FROM `cases`', function(err, result) {
  			if(err) {
  				res.send("[{error:\"An Error Occured\"}]");
  			} else {
  				res.send(JSON.stringify(result));
  			}
		});
	} else {
		query = connection.query('SELECT * FROM `cases` WHERE id = '+connection.escape(id), function(err, result) {
	  		if(err) {
	  			res.send("[{error:\"An Error Occured\"}]");
	  		} else {
	  			res.send(JSON.stringify(result));
	  		}
		});
	}
});

router.get('/del/:id', function(req, res) {
	var sid = req.param('sid');
	var id = req.param('id');
	if(typeof(id)==='undefined' || typeof(sid)==='undefined') {
		res.send("{\"error\":\"Bad Get/Post Data\"}");
	}

	// Check Session
	var sid_obj = global.checkSessionID(req, res, sid);

	// Make sure it was valid.
	if(typeof(sid_obj)!=='object') {
		res.send("{\"error\":\"Invalid Session\"}");
	} else {
		var query = connection.query('DELETE FROM `cases` WHERE id = '+connection.escape(id), function(err, result) {
  			if(err) {
  				res.send("{\"error\":\"An Error Occured\"}");
  			} else {
  				res.send("{\"success\":\"Deleted\"}");
  			}
		});
	}
});

router.post('/new', function(req, res) {
	var accused = req.param('accused');
	var by = req.param('by');
	var text = req.param('text');
	var when = req.param('when');
	var created = getMysqlTimeNow();
	var sid = req.param('sid');
	if(typeof(accused)==='undefined' || typeof(by)==='undefined' || typeof(text)==='undefined' || typeof(when)==='undefined' || typeof(sid)==='undefined') {
		res.send("{\"error\":\"Bad Post Data\"}");
	}

	// Check Session
	var sid_obj = global.checkSessionID(req, res, sid);

	// Make sure it was valid.
	if(typeof(sid_obj)!=='object') {
		res.send("{\"error\":\"Invalid Session\"}");
	} else {
		var to_insert = {accused: accused, by: by, text: text, happened: when, created: created};
		var query = connection.query('INSERT INTO `cases` SET ?', to_insert, function(err, result) {
  			if(err) {
  				res.status(500);
  				res.send("{\"error\":\"An Error Occured\"}");
  			} else {
  				res.send("{\"success\":\"Posted\"}");
  			}
		});
	}
});

router.post('/update', function(req, res) {
	var id = connection.escape(req.param('id'));
	var by = connection.escape(req.param('by'));
	var text = connection.escape(req.param('text'));
	var when = connection.escape(req.param('when'));
	var status = connection.escape(req.param('status'));
	var created = "2014-06-11 00:00:00.000000";
	if(typeof(id)==='undefined' || typeof(accused)==='undefined' || typeof(by)==='undefined' || typeof(text)==='undefined' || typeof(when)==='undefined' || typeof(status)==='undefined' || typeof(sid)==='undefined') {
		res.send("{\"error\":\"Bad Post Data\"}");
	}
	// Check Session
	var sid_obj = global.checkSessionID(req, res, sid);

	// Make sure it was valid.
	if(typeof(sid_obj)!=='object') {
		res.send("{\"error\":\"Invalid Session\"}");
	} else {
		var to_insert = {accused: accused, by: by, text: text, happened: when, created: created};
		var query = connection.query('UPDATE `cases` WHERE id ='+connection.escape(id)+' SET ?', to_insert, function(err, result) {
  			if(err) {
  				res.status(500);
  				res.send("{\"error\":\"An Error Occured\"}");
  			} else {
  				res.send("{\"success\":\"Posted\"}");
  			}
		});
	}
});

router.get('/new', function(req, res){
	res.status(400);
	res.send("{\"error\":\"Use Post.\"}");
});

router.get('/update', function(req, res){
	res.status(400);
	res.send("{\"error\":\"Use Post.\"}");
});

module.exports = router;