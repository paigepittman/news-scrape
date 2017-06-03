var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var News = require("./models/News.js");
var Com = require("./models/Comments.js")
var cheerio = require("cheerio");
var request = require("request");
var exphbs = require("express-handlebars");


var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/bass");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});


///Routes
// get route for scraping

app.get("/", function(req, res) {
  News.find({}, function(err, doc) {
    var hbsObject = {news: doc}
    console.log("*************************" + hbsObject);
    res.render("index", hbsObject);
  })

})

app.get("/scrape", function(req, res) {
  request("http://www.dancingastronaut.com/news/", function(error, response, html) {
    var $ =  cheerio.load(html);
    $("article h2").each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      var clip = new News(result);
      clip.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
      else {
        // var hbsObject = {news: doc};
        // console.log("*************hbs***********" + hbsObject);
        res.redirect("/")
      }
      });

    });
  });
});

//get route for pulling scraped news
app.get("/news", function(req, res) {
  // Grab every doc in the Articles array
  News.find({}, function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});
//post route for commenting
app.post("/comment/:id", function(req, res) {
 var newCom = new Com(req.body);
 newCom.save(function(err, doc) {

   if (err) {
     console.log(err);
   }
   else {
     News.findOneAndUpdate({ "_id": req.params.id }, { "com": doc._id })
     // Execute the above query
     .exec(function(err, doc) {
       // Log any errors
       if (err) {
         console.log(err);
       }
       else {
         // Or send the document to the browser
res.redirect("/")
       }
     });
   }
 });
});
//post route for adding favorites
app.post("/favorite/:id", function(req, res) {

      News.findOneAndUpdate({ "_id": req.params.id }, { "favorite": true })
      // Execute the above query
      .exec(function(err, doc) {

        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    });


//get route for viewing favorites
app.get("/favorites", function(req, res) {
  // Grab every doc in the Articles array
  News.find({favorite:true}, function(err, doc) {
    var hbsObject = {favorites: doc};
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("favorites", hbsObject);
    }
  });
});


//get route for viewing comments


app.listen(5000, function() {
  console.log("App running on port 5000!");
});
