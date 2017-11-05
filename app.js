const express = require('express');
const pug = require('pug');

var app = express();
app.use(express.static(__dirname));
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function(request, response){
	response.render('index');
});

//-----uncomment for hosting/testing locally:

// app.listen(8080, function() {
//   console.log('localhost:8080');
// });

//-----uncomment for hosting remotely:

app.listen(process.env.PORT, '0.0.0.0', function() {
  console.log(app.url);
});