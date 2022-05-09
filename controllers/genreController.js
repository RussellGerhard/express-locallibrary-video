const { body, validationResult } = require("express-validator");
var Genre = require("../models/genre");
var Book = require("../models/book");

var async = require("async");

// Display list of all genres
exports.genre_list = function (req, res, next) {
  Genre.find()
    // 1 is same as "ascending" or "asc"
    .sort({ name: 1 })
    .exec(function (err, list_genres) {
      if (err) {
        return next(err);
      }
      res.render("genre_list", {
        title: "Genre List",
        genre_list: list_genres,
      });
    });
};

// Display detail page for a specific genre
exports.genre_detail = function (req, res, next) {
  async.parallel(
    {
      // Pass in callback and execute it to pipe results to function at end of parallel call
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    // results.genre is result of first func, results.genre_books is result of second
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Success
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display genre create form on GET
exports.genre_create_get = function (req, res) {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle genre create form on POST with an array of middleware functions
exports.genre_create_post = [
  // Validate and sanitize the data using express-validator middleware functions
  body("name", "Genre name required.").trim().isLength({ min: 1 }).escape(),
  // Handle request
  (req, res, next) => {
    const errors = validationResult(req);
    var genre = new Genre({ name: req.body.name });
    // There are validation errors
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    }
    // There aren't validation errors
    else {
      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        // Handle DB lookup error
        if (err) {
          return next(err);
        }
        // Redirect to genre if it already exists
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          // Save new genre
          genre.save(function (err) {
            // Handle DB error
            if (err) {
              return next(err);
            }
            // Redirect to new genre url
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display genre delete form on GET
exports.genre_delete_get = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      book_list: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: results.genre,
        genre_books: results.book_list,
      });
    }
  );
};

// Handle genre delete form on POST
exports.genre_delete_post = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      book_list: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book_list.length > 0) {
        res.render("genre_delete", {
          title: "Delete Genre",
          genre: results.genre,
          genre_books: results.book_list,
        });
        return;
      } else {
        Genre.findByIdAndDelete(req.body.genreid, function deleteGenre(err) {
          if (err) {
            return next(err);
          }
          res.redirect("/catalog/genres");
        });
      }
    }
  );
};

// Display genre update form on GET
exports.genre_update_get = function (req, res, next) {
  Genre.findById(req.params.id).exec((err, found_genre) => {
    if (err) {
      return next(err);
    }
    if (found_genre === null) {
      var err = new Error("Could not find genre");
      err.status = "404";
      return next(err);
    } else {
      res.render("genre_form", { genre: found_genre });
    }
  });
};

// Handle genre update form on POST
exports.genre_update_post = [
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    var errors = validationResult(req);

    var genre = Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        genre: genre,
        errors: errors.array(),
      });
    } else {
      // Success, update away
      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, newgenre) => {
        if (err) {
          return next(err);
        }
        res.redirect(newgenre.url);
      });
    }
  },
];
