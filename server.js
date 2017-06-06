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
  // News.remove();
  request("http://www.dancingastronaut.com/news/", function(error, response, html) {
    var $ =  cheerio.load(html);
    $("article h3").each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.content = $(this).children("a").attr("item-content");
      var clip = new News(result);
      clip.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
      else {
        console.log(doc);
        // var hbsObject = {news: doc};
        // console.log("*************hbs***********" + hbsObject);
        // res.render("index", hbsObject);
        res.redirect("/");

      }
      });

    });
  });
});

app.get("/readarticle/:id", function(req, res) {

  var articleID = req.params.id;
  console.log(articleID);
  News.findOne({"_id": articleID}, function(err, doc) {

    console.log("URL*******" + doc.link);
    var articleURL = doc.link;


    request(articleURL, function(error, response, html) {
      var $ =  cheerio.load(html);
      console.log("URL AT LINE 81" + articleURL);
      $("div.entry-content").each(function(i, element) {
        var result = $(this).children("p").text();
        console.log("RESULT>>>>>>>>>>>" + result);

          News.findOneAndUpdate({"_id": articleID}, {"content": result})
          .exec(function(err, newdoc) {
            var hbsObject = {articles: newdoc};
            if (err) {
              console.log(err);
            }
            else {
              console.log("URL AT LINE 94" + articleURL);
              console.log("NEWDOC" + newdoc);
              News.findOne({"_id" : articleID})
              .exec(function(err, entry) {
              res.render("articles", entry);
            })
            }
          });


      });
    });
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
     .exec(function(err, doc) {
       if (err) {
         console.log(err);
       }
       else {
         res.redirect("back")
       }
     });
   }
 });
});
app.post("articles/comment/:id", function(req, res) {
 var newCom = new Com(req.body);
 newCom.save(function(err, doc) {

   if (err) {
     console.log(err);
   }
   else {
     News.findOneAndUpdate({ "_id": req.params.id }, { "com": doc._id })
     .exec(function(err, doc) {
       if (err) {
         console.log(err);
       }
       else {
         res.redirect("back")
       }
     });
   }
 });
});

app.get("/comment/:id", function(req, res) {
     Com.find({ "_id": req.params.id })
     // Execute the above query
     .exec(function(err, doc) {
       // Log any errors
       if (err) {
         console.log(err);
       }
       else {
         // Or send the document to the browser
res.redirect("back")
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
          res.redirect("back");
        }
      });
    });
app.post("readarticle/favorite/:id", function(req, res) {

          News.findOneAndUpdate({ "_id": req.params.id }, { "favorite": true })
          // Execute the above query
          .exec(function(err, doc) {

            if (err) {
              console.log(err);
            }
            else {
              res.redirect("back");
            }
          });
        });
        app.post("favorites/unfavorite/:id", function(req, res) {

              News.findOneAndUpdate({ "_id": req.params.id }, { "favorite": false })
              // Execute the above query
              .exec(function(err, doc) {

                if (err) {
                  console.log(err);
                }
                else {
                  res.redirect("back");
                }
              });
            });

    app.post("readarticle/unfavorite/:id", function(req, res) {

          News.findOneAndUpdate({ "_id": req.params.id }, { "favorite": false })
          // Execute the above query
          .exec(function(err, doc) {

            if (err) {
              console.log(err);
            }
            else {
              res.redirect("back");
            }
          });
        });
        app.post("/unfavorite/:id", function(req, res) {

              News.findOneAndUpdate({ "_id": req.params.id }, { "favorite": false })
              // Execute the above query
              .exec(function(err, doc) {

                if (err) {
                  console.log(err);
                }
                else {
                  res.redirect("back");
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
        Com.findOne({"_id":req.params.id})
          .populate("note")
          .exec(function(error, doc) {

        res.render("favorites", hbsObject);
      })
    }
  });
});

// app.get("/comments/:id", function(req, res) {
//   // Grab every doc in the Articles array
//   Com.findOne({"_id":req.params.id})
//
//     .populate("note")
//
//     .exec(function(error, doc) {
//
//
//     // Log any errors
//     if (err) {
//       console.log(err);
//     }
//     // Or send the doc to the browser as a json object
//     else {
//       console.log(doc);
//       return doc;
//     }
//   });
// });



app.listen(5000, function() {
  console.log("App running on port 5000!");
});
