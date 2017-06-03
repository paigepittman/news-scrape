var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ComsSchema = new Schema({

  body: {
    type: String
  }
});


var Com = mongoose.model("Comment", ComsSchema);

// Export the Note model
module.exports = Com;
