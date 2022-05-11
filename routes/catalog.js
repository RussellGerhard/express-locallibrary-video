var express = require("express");
var router = express.Router();

// Require controller modules (used as callbacks)
var book_controller = require("../controllers/bookController");
var author_controller = require("../controllers/authorController");
var genre_controller = require("../controllers/genreController");
var bookinstance_controller = require("../controllers/bookinstanceController");
var user_controller = require("../controllers/userController");

/// BOOK ROUTES ///

// GET catalog homepage
router.get("/", book_controller.index);

// GET req for creating book **must** come before req for display
router.get(
  "/book/create",
  user_controller.redirectLogin,
  book_controller.book_create_get
);

// POST req for creating book
router.post(
  "/book/create",
  user_controller.redirectLogin,
  book_controller.book_create_post
);

// GET req for deleting a book
router.get(
  "/book/:id/delete",
  user_controller.redirectLogin,
  book_controller.book_delete_get
);

// POST req for deleting a book
router.post(
  "/book/:id/delete",
  user_controller.redirectLogin,
  book_controller.book_delete_post
);

// GET req for updating a book
router.get(
  "/book/:id/update",
  user_controller.redirectLogin,
  book_controller.book_update_get
);

// POST req for updating a book
router.post(
  "/book/:id/update",
  user_controller.redirectLogin,
  book_controller.book_update_post
);

// GET req for displaying a book
router.get("/book/:id", book_controller.book_detail);

// GET req for displaying list of books
router.get("/books", book_controller.book_list);

/// AUTHOR ROUTES ///

// GET req for creating an author
router.get(
  "/author/create",
  user_controller.redirectLogin,
  author_controller.author_create_get
);

// POST req for creating an author
router.post(
  "/author/create",
  user_controller.redirectLogin,
  author_controller.author_create_post
);

// GET req for deleting an author
router.get(
  "/author/:id/delete",
  user_controller.redirectLogin,
  author_controller.author_delete_get
);

// POST req for deleting an author
router.post(
  "/author/:id/delete",
  user_controller.redirectLogin,
  author_controller.author_delete_post
);

// GET req for updating an author
router.get(
  "/author/:id/update",
  user_controller.redirectLogin,
  author_controller.author_update_get
);

// POST req for updating an author
router.post(
  "/author/:id/update",
  user_controller.redirectLogin,
  author_controller.author_update_post
);

// GET req for one author
router.get("/author/:id", author_controller.author_detail);

// GET req for list of authors
router.get("/authors", author_controller.author_list);

/// GENRE ROUTES ///

// GET req for creating a genre
router.get(
  "/genre/create",
  user_controller.redirectLogin,
  genre_controller.genre_create_get
);

// POST req for creating a genre
router.post(
  "/genre/create",
  user_controller.redirectLogin,
  genre_controller.genre_create_post
);

// GET req for deleting a genre
router.get(
  "/genre/:id/delete",
  user_controller.redirectLogin,
  genre_controller.genre_delete_get
);

// POST req for deleting a genre
router.post(
  "/genre/:id/delete",
  user_controller.redirectLogin,
  genre_controller.genre_delete_post
);

// GET req for updating a genre
router.get(
  "/genre/:id/update",
  user_controller.redirectLogin,
  genre_controller.genre_update_get
);

// POST req for updating a genre
router.post(
  "/genre/:id/update",
  user_controller.redirectLogin,
  genre_controller.genre_update_post
);

// GET req for one genre
router.get("/genre/:id", genre_controller.genre_detail);

// GET req for list of genres
router.get("/genres", genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///

// GET req for creating a bookinstance
router.get(
  "/bookinstance/create",
  user_controller.redirectLogin,
  bookinstance_controller.bookinstance_create_get
);

// POST req for creating a bookinstance
router.post(
  "/bookinstance/create",
  user_controller.redirectLogin,
  bookinstance_controller.bookinstance_create_post
);

// GET req for deleting a bookinstance
router.get(
  "/bookinstance/:id/delete",
  user_controller.redirectLogin,
  bookinstance_controller.bookinstance_delete_get
);

// POST req for deleting a bookinstance
router.post(
  "/bookinstance/:id/delete",
  user_controller.redirectLogin,
  bookinstance_controller.bookinstance_delete_post
);

// GET req for updating a bookinstance
router.get(
  "/bookinstance/:id/update",
  user_controller.redirectLogin,
  bookinstance_controller.bookinstance_update_get
);

// POST req for updating a bookinstance
router.post(
  "/bookinstance/:id/update",
  user_controller.redirectLogin,
  bookinstance_controller.bookinstance_update_post
);

// GET req for one bookinstance
router.get("/bookinstance/:id", bookinstance_controller.bookinstance_detail);

// GET req for list of bookinstances
router.get("/bookinstances", bookinstance_controller.bookinstance_list);

module.exports = router;
