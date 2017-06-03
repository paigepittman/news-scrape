var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NewsSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  com: {
    type: Schema.Types.ObjectId,
    ref: "Com"
  },

  favorite: {
    type: Boolean(false)
  }
});

// Create the Article model with the ArticleSchema
var News = mongoose.model("News", NewsSchema);

// Export the model
module.exports = News;
