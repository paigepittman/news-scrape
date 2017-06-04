var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NewsSchema = new Schema({

  title: {
    type: String,
    index: {
            unique: true
        }
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
    type: Boolean,
    default: false
  },
  content: {
    type: String
  }
});

// Create the Article model with the ArticleSchema
var News = mongoose.model("News", NewsSchema);

// Export the model
module.exports = News;
