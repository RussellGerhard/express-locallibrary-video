const { DateTime } = require("luxon");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date },
});

BookInstanceSchema.virtual("url").get(function () {
  return "/catalog/bookinstance/" + this._id;
});

BookInstanceSchema.virtual("due_back_formatted").get(function () {
  if (this.due_back) {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
  } else {
    return "";
  }
});

BookInstanceSchema.virtual("due_back_disp_format").get(function () {
  if (this.due_back) {
    return DateTime.fromJSDate(this.due_back)
      .setLocale("zh")
      .toFormat("yyyy-MM-dd");
  } else {
    return "";
  }
});

module.exports = mongoose.model("BookInstance", BookInstanceSchema);
