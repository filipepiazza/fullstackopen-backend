const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  url: { type: String, required: true },
  likes: { type: Number, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: String,
    },
  ],
});

// Custom validation function
blogSchema.statics.validateUpdate = function (update) {
  const UpdateModel = this.model(this.modelName);
  const dummy = new UpdateModel(update);
  return dummy.validateSync();
};

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Blog = mongoose.model("Blog", blogSchema);

const modelBlogExports = {
  Blog,
};

module.exports = modelBlogExports;
