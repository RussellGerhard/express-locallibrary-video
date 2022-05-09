var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var catalogRouter = require("./routes/catalog");

// Create app!
var app = express();

// Set up mongoose connection to url provided by MongoDB
var mongoose = require("mongoose");
var mongoDB = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zfsde.mongodb.net/local_library?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  // This is causing the app to crash
  // useUnifiedTechnology: true,
});

// Get default connection object into db variable and bind error to get console notifications
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Helpful middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static file inclusion
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
