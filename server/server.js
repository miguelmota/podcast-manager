'use strict';

var app = require('./lib/app');
var port = process.env.PORT || 5789;

app.listen(port, function() {
  console.log('Listening on port ' + port);
});
