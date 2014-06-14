var debug = require('debug')('src');
var app = require('../app');

app.set('port', 80);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
