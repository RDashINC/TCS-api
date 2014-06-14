/**
 * (c) 2014 RDashINC
 *
 * @author RainbowDashDC
 * @link http://rainbowdashdc.github.io/
 * @version see global.pver
**/

global.pver = "1.0.1.2-master";

// Load modules...
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Load Routes
var routes = require('./routes/index');
var cases = require('./routes/cases');
var sign = require('./routes/sign');
var server = require('./routes/server');
var auth = require('./routes/auth');

// Start APP.
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// paths
app.use('/', routes);
app.use('/cases', cases);
app.use('/sign', sign);
app.use('/server', server);
app.use('/auth', auth);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

global.checkSessionID = function(req, res, sid) {
	var fs= require('fs');
	var file = "sessions/"+sid+".sid";
	console.log("[app] Checking session ID: '"+sid+"'");
	if(fs.existsSync(file)) {
		console.log("[app] Valid");
		var file_data = fs.readFileSync(file);
		var file_obj = JSON.parse(file_data);

		if(file_obj.api_calls == 10) {
			// Has Expired.
			console.log("[app] Expired.");
			res.send("{\"error\":\"expired\"}");

			// Delete session.
			var error = fs.unlinkSync(file);
			if(error) {
				return false;
			}
		} else {
			file_obj.api_calls=file_obj.api_calls+1;
			console.log("[app] Session has used: "+file_obj.api_calls)

			// Convert to JSON
			var file_serialized=JSON.stringify(file_obj);

			// Write to session.
			var error = fs.writeFileSync(file, file_serialized);
			if(error) {
				return false;
			}
		}

		// Write to session.
		return file_obj;
	} else {
		console.log("[app] Invalid");
		return false;
	}
}

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
