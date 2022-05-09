var { body, validationResult } = require("express-validator");
var BookInstance = require("../models/bookinstance");
var Book = require("../models/book");

var async = require("async");

// Display list of all BookInstances
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .exec(function (err, list_bookinstances) {
      if (err) {
        return next(err);
      }
      res.render("bookinstances_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookinstance_result) {
      if (err) {
        return next(err);
      }
      if (bookinstance_result == null) {
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_detail", {
        bookinstance: bookinstance_result,
      });
    });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, "title").exec((err, books) => {
    if (err) {
      return next(err);
    }
    res.render("bookinstance_form", {
      title: "Create Book Instance",
      book_list: books,
    });
  });
};

// Handle BookInstance create form on POST
exports.bookinstance_create_post = [
  // Validation middleware
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due-back", "Invalid due date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      bookinstance.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      res.render("bookinstance_delete", {
        title: "Delete Book Instance",
        bookinstance: bookinstance,
        book: bookinstance.book,
      });
    });
};

// Handle BookInstance delete form on POST
exports.bookinstance_delete_post = function (req, res) {
  BookInstance.findByIdAndDelete(
    req.body.bookinstanceid,
    function deleteBookInstance(err) {
      if (err) {
        return next(err);
      }
      res.redirect("/catalog/bookinstances");
    }
  );
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function (req, res, next) {
  async.parallel(
    {
      book_list: function (callback) {
        Book.find(callback);
      },
      bookinstance: function (callback) {
        BookInstance.findById(req.params.id).populate("book").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.bookinstance === null) {
        var err = new Error("Book Instance not found");
        error.status = "404";
        return next(err);
      }
      res.render("bookinstance_form", {
        title: "Update BookInstance",
        bookinstance: results.bookinstance,
        book: results.bookinstance.book,
        selected_book: results.bookinstance.book._id.toString(),
        book_list: results.book_list,
      });
    }
  );
};

// Handle BookInstance update form on POST
exports.bookinstance_update_post = [
  // Validate and sanitize fields
  body("book", "Book must be specified.").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due-back", "Invalid due date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    // Add 4 hours to accurately represent EST in GMT
    // because JS uses GMT as default
    var due_back_est = new Date(req.body.due_back);
    var due_back_est = due_back_est.setTime(
      due_back_est.getTime() + 4 * 3600 * 1000
    );
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: due_back_est,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        res.render("bookinstance_form", {
          title: "Update BookInstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        function (err, thebookinstance) {
          if (err) {
            return next(err);
          }
          res.redirect(thebookinstance.url);
        }
      );
    }
  },
];
