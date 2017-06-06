var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ComsSchema = new Schema({

  body: {
    type: String
  }
});


var Com = mongoose.model("Comment", ComsSchema);

module.exports = Com;
