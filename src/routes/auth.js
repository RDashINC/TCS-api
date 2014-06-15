var express = require('express');
var fs = require('fs');
var router = express.Router();
var mysql      = require('mysql');
var connection = require('../config/database');

function getMysqlTimeNow() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function getRandomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function destroy(req, res) {
  var sid = req.param('sid');
  var file = "sessions/"+sid+".sid";

  if(typeof(sid)==='undefined') {
    res.status(400);
    res.send("{\"error\":\"Bad Post Data\"}");
  }

  if(!fs.existsSync(file)) {
    res.send("{\"error\":\"Session Doesn't Exist\"}");
  } else {
    console.log("[auth] Checking if session belongs to user.");
    var sid_json = fs.readFileSync(file);
    var sid_json = JSON.parse(sid_json);

    if(username = sid_json.username) {
      console.log("[auth] Deleting Session");
      fs.unlinkSync(file);
      console.log("[auth] Done");
      res.send("{\"success\":\"true\"}");
    } else {
      res.send("{\"error\":\"Session doesn't belong to user\"}");
    }
  }
}

router.use(function(req, res, next) {
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	next();
});

/* Base get, throws error. */
router.get('/', function(req, res) {
	res.send("{\"error\":\"no 'action'\"}]");
});

router.post('/register', function(req, res) {
  res.send("{\"error\":\"Deprecated\"");
});

router.post('/new', function(req, res) {
  var username = connection.escape(req.param('username'));
  var password = connection.escape(req.param('password'));
  if(typeof(username)==='undefined' || typeof(password)==='undefined') {
    res.status(400);
    res.send("{\"error\":\"Bad Post Data\"}");
  }

  // Fix ''
  username=username.replace('\'', '');
  username=username.replace('\'', '');

  // Check Credentials
  var query = connection.query('SELECT * FROM `students` WHERE username=\''+username+'\'', function(err, result) {
    if(err) {
      console.log(result);
      res.status(500);
      res.send("{\"error\":\"Failed to create session. [3]\"}");
    } else {
      if(typeof(result[0])==='undefined') {
        res.status(200);
        res.send("{\"error\":\"Username or password is invalid\"}");
      } else {
        // Gen the Session ID.
        var session_id = getRandomString(64, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        // Make session valid
        var error = fs.writeFileSync("sessions/"+session_id+".sid", "{\"username\":\""+result[0].username+"\", \"created\":\""+getMysqlTimeNow()+"\", \"admin\":"+result[0].admin+", \"api_calls\":0}", { encoding: "utf8" });
        if(error) {
          res.status(500);
          res.send("{\"error\":\"Failed to create session. [1]\"}");
        }

        // Send ID.
        res.send("{\"session\":\""+session_id+"\"}");
      }
    }
  });
});


router.get('/admin/:id', function(req, res) {
  var id=req.param('id');
  var sid=req.param('sid');

  if(typeof(id)==='undefined' || typeof(sid)==='undefined') {
    res.send("{\"error\":\"Bad Post Data\"}");
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
      var query = connection.query('UPDATE `students` SET admin=1 WHERE id='+connection.escape(id), function(err, result) {
          if(err) {
            res.status(500);
            res.send("{\"error\":\"An Error Occured\"}");
          } else {
            res.send("{\"success\":\"is now an admin\"}");
          }
      });
    }
  }
});

router.get('/undadmin/:id', function(req, res) {
  var id=req.param('id');
  var sid=req.param('sid');

  if(typeof(id)==='undefined' || typeof(sid)==='undefined') {
    res.send("{\"error\":\"Bad Post Data\"}");
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
      var query = connection.query('UPDATE `students` SET admin=0 WHERE id='+connection.escape(id), function(err, result) {
          if(err) {
            res.status(500);
            res.send("{\"error\":\"An Error Occured\"}");
          } else {
            res.send("{\"success\":\"De-admined\"}");
          }
      });
    }
  }
});


router.get('/destroy/:sid', destroy);
router.post('/destroy', destroy);

router.get('/new', function(req, res) {
  res.status(400);
  res.send("{\"error\":\"Use POST\"}");
});

router.get('/register', function(req, res) {
  res.status(400);
  res.send("{\"error\":\"Deprecated\"}");
});


// /new = new session id [done]
// /destroy = logout [wip]
// /update = update creds
// /register = new user [done]

module.exports = router;