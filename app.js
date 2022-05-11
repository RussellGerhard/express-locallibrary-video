var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var dotenv = require("dotenv").config();
var MongoStore = require("connect-mongo");
var session = require("express-session");

var indexRouter = require("./routes/index");
var catalogRouter = require("./routes/catalog");
var userRouter = require("./routes/users");

const IN_PROD = process.env.NODE_ENV === "production";

// Create app!
var app = express();

// Use sessions
app.use(
  session({
    name: process.env.SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zfsde.mongodb.net/local_library?retryWrites=true&w=majority`,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
      crypto: {
        secret: process.env.MONGO_SECRET,
      },
    }),
    cookie: {
      maxAge: parseInt(process.env.SESS_LIFETIME),
      sameSite: true,
      secure: IN_PROD,
    },
  })
);

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
app.use("/users", userRouter);

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
