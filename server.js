const	express = require("express"),
			bodyParser = require("body-parser"),
			logger = require("morgan"),
			mongoose = require("mongoose"),
			request = require("request"),
			cheerio = require("cheerio"),
			PORT = process.env.PORT || 3011;
			exphbs = require('express-handlebars'), 
			util = require('util'),
			jquery = require('jquery');

var	Article = require('./models/articleModel.js'),
		Note = require('./models/noteModel.js');
var Promise = require("bluebird");

mongoose.Promise = Promise;

var app = express();

app.engine('hbs', exphbs({ 
  extname: 'hbs', 
  defaultLayout: 'main', 
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));


mongoose.connect("mongodb://heroku_z3vrnqqn:u5ah129tbdnucvkud7ksra1ika@ds119718.mlab.com:19718/heroku_z3vrnqqn");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});



app.use(logger('combined'));
logger('combined', {buffer: true});

request("http://www.cnn.com", function(error, response, html) {

  var $ = cheerio.load(html);

  

  $(".story").each(function(i, element) {

  	var storyTitle = $(element).find(".story-title.heading").children("a").first().text();
  	var storyDate = $(element).find(".author-date.visible-sm-block").children("span.timestamp").first().text();
    var storyLink = $(element).find(".story-title.heading").children("a").first().attr("href");
    var para1 = $(element).find(".story-intro").find("p").first().text();

    var newArticle = new Article({
    	title: storyTitle,
     	date: storyDate,
     	link: "http://www.cnn.com" + storyLink,
     	story: para1
    });

    newArticle.save(function(err, data) {
    	if(err) {
    		console.log("newarticle save error is " + err);
    	} else {
    		console.log(data);
    	}
    });
  }); 
});

app.get('/', function(req, res) {

	var article = new Article(req.query);


	article.retrieveAll(res);

});

app.get('/detail', function(req, res) {

	var article = new Article(req.query);

	article.retrieveOne(req, res);


});

app.get('/submit', function(req, res) {

	var note = new Note(req.query);
	console.log('note instance ' + note);
	note.saveNote(req, res, Article, note);

});

app.get('/shownotes', function(req, res) {
	var article = new Article(req.query);
	console.log('article instance ' + article);
	article.viewNotes(req, res, Note, article);
});

app.listen(PORT, function() {
	console.log('app listening on port ' + PORT);
});
