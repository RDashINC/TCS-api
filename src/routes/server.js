var express = require('express');
var router = express.Router();
var fs = require('fs');

router.use(function(req, res, next) {
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	next();
});

/* Base get, throws error. */
router.get('/', function(req, res) {
	res.send("{\"error\":\"no 'action'\"}");
});

/**
 * Needs Auth, disabled 'till then.
 **/
router.get('/shutdown', function(req, res) {
  var sid = req.param('sid');
  if(typeof(sid)==='undefined') {
	res.send("{\"error\":\"Bad Get/Post Data\"}");
  }
  
  // Check Session
  var sid_obj = global.checkSessionID(req, res, sid);

  // Make sure it was valid.
  if(typeof(sid_obj)!=='object') {
    res.send("{\"error\":\"Invalid Session\"}");
  } else {
  	if(!sid_obj.admin) {
  		res.send("{\"error\":\"Permission Denied\"}");
  	} else {
  		console.log("Remotely shutdown. ["+req.ip+"]");
  		process.exit(2);
  	}
  }
});

router.get('/restart', function(req, res) {
  var sid = req.param('sid');
  if(typeof(sid)==='undefined') {
	res.send("{\"error\":\"Bad Get/Post Data\"}");
  }

  // Check Session
  var sid_obj = global.checkSessionID(req, res, sid);

  // Make sure it was valid.
  if(typeof(sid_obj)!=='object') {
    res.send("{\"error\":\"Invalid Session\"}");
  } else {
  	if(!sid_obj.admin) {
  		res.send("{\"error\":\"Permission Denied\"}");
  	} else {
 		console.log("Told to restart. ["+req.ip+"]");
  		process.exit(3);
  	}
  }
});

router.get('/version', function(req, res) {
  res.send("{\"version\":\""+global.pver+"\"}");
});

router.get('/news', function(req, res) {
  res.send(fs.readFileSync('news.json'));
});



module.exports = router;