var express      = require('express');
var router       = express.Router();
var passwordHash = require('password-hash');
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

router.get('/here/:id', function(req, res) {
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
    var query = connection.query('UPDATE `students` SET here=1 WHERE id='+connection.escape(id), function(err, result) {
        if(err) {
          res.status(500);
          res.send("{\"error\":\"An Error Occured\"}");
        } else {
          res.send("{\"success\":\"Here\"}");
        }
    });
  }
});

router.post('/register', function(req, res) {
  var first_name = req.param('firstname');
  var last_name  = req.param('lastname');
  var sid        = req.param('sid');
  var full_name  = first_name+" "+last_name;
  var username   = req.param('username');
  var password   = req.param('password');
  var created    = getMysqlTimeNow();

  if(typeof(first_name)==='undefined' || typeof(last_name)==='undefined' || typeof(sid)==='undefined' || typeof(username)==='undefined' || typeof(password)==='undefined') {
    res.send("{\"error\":\"Bad Post Data\"}");
  }

  // Check Session
  var sid_obj = global.checkSessionID(req, res, sid);

  // Make sure it was valid.
  if(typeof(sid_obj)!=='object') {
    res.send("{\"error\":\"Invalid Session\"}");
  } else {
    // Check if the users username is in the DB.
    var query = connection.query('SELECT * FROM `students` WHERE username=\''+username+'\'', function(err, result) {
      console.log(result);
      if(typeof(result[0]) !== 'undefined' ) {
        // Return a 600, unused HTTP code.
        res.status(600);
        res.send("{\"error\":\"User already exists\"}");
      } else {
        // Send obj.
        console.log(result);

        // Hash the password.
        password = passwordHash.generate(password, {algorithm: 'sha512'});

        var to_insert = {fullname: full_name, firstname: first_name, lastname: last_name, username: username, passwordHash: password, admin: false, created: created};
        query = connection.query('INSERT INTO `students` SET ?', to_insert, function(err, result) {
        if(err) {
          res.status(500);
          res.send("{\"error\":\"An Error Occured\"}");
        } else {
          res.status(200);
          res.send("{\"success\":\"User Created\"}");
        }});
      }
    });
  }
});

router.get('/status/:id', function(req, res) {
  var id = req.param('id');
  var sid = req.param('sid');
  var query='';

  if(typeof(id)==='undefined' || typeof(sid)==='undefined') {
    res.send("{\"error\":\"Bad Post Data\"}");
  }


  // Check Session
  var sid_obj = global.checkSessionID(req, res, sid);

  // Make sure it was valid.
  if(typeof(sid_obj)!=='object') {
    res.send("{\"error\":\"Invalid Session\"}");
  } else {
    if(id==="all") {
      query = connection.query('SELECT * FROM `students`', function(err, result) {
        if(err) {
          res.status(500);
          res.send("{\"error\":\"An Error Occured\"}");
        } else {
          res.send(JSON.stringify(result));
        }
      });
    } else {
      query = connection.query('SELECT * FROM `students` WHERE id = '+connection.escape(id), function(err, result) {
        if(err) {
          res.status(500);
          res.send("{\"error\":\"An Error Occured\"}");
        } else {
          res.send(JSON.stringify(result));
        }
      });
    }
  }
});

router.get('/del/:id', function(req, res) {
  var id = req.param('id');
  var sid = req.param('sid');

  if(typeof(id)==='undefined' || typeof(sid)==='undefined') {
    res.send("{\"error\":\"Bad Post Data\"}");
  }


  // Check Session
  var sid_obj = global.checkSessionID(req, res, sid);

  // Make sure it was valid.
  if(typeof(sid_obj)!=='object') {
    res.send("{\"error\":\"Invalid Session\"}");
  } else {
    var query = connection.query('DELETE FROM `students` WHERE id = '+connection.escape(id), function(err, result) {
      if(err) {
        res.status(500);
        res.send("{\"error\":\"An Error Occured\"}");
      } else {
        res.send("{\"success\":\"Deleted\"}");
      }
    });
  }
});


router.get('/leave/:id', function(req, res) {
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
    var query = connection.query('UPDATE `students` SET here=0 WHERE id='+connection.escape(id), function(err, result) {
        if(err) {
          console.log(err);
          res.status(500);
          res.send("{\"error\":\"An Error Occured\"}");
        } else {
          res.send("{\"success\":\"Left\"}");
        }
    });
  }
});

module.exports = router;