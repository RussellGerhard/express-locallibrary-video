const { body, validationResult } = require("express-validator");
var User = require("../models/user");

// Display user registration
exports.user_register_get = function (req, res) {
  res.render("register", {
    title: "Local Library - Register Account",
  });
};

// Handle user registration
exports.user_register_post = [
  // Validate and sanitize input
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name must not be empty")
    .isAlpha()
    .withMessage("Name must only contain alphabetical characters")
    .escape(),
  body("email", "Email must not be empty").trim().isLength({ min: 1 }).escape(),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    User.find({ email: req.body.email }, (err, found_user) => {
      if (err) {
        return next(err);
      }

      // already an account with this email
      if (found_user.length) {
        res.render("register", {
          title: "Local Library - Register Account",
          error_msg: `Sorry, ${req.body.email} is already associated with an account!`,
        });
        return;
      }

      // we can create a new user
      var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      user.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/users/login");
      });
    });
  },
];

// Display user login
exports.user_login_get = function (req, res, next) {
  res.render("login", {
    title: "Local Library - Log In",
  });
};

// Handle user login
exports.user_login_post = [
  // Validate and sanitize input
  body("email", "Email must not be empty").trim().isLength({ min: 1 }).escape(),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Handle login
  (req, res, next) => {
    User.getAuthenticated(
      req.body.email,
      req.body.password,
      (err, user, reason) => {
        if (err) {
          return next(err);
        }

        // Log in successful!
        if (user) {
          req.session.userId = user._id;
          res.redirect("/catalog");
          return;
        }

        // Report login error reason
        var reasons = User.failedLogin;
        switch (reason) {
          case reasons.NOT_FOUND:
            var error_message = "User not found";
            break;
          case reasons.PASSWORD_INCORRECT:
            var error_message = "Password incorrect";
            break;
          case reasons.MAX_ATTEMPTS:
            var error_message = "Too many attempts, try again in 10 seconds!";
            break;
        }
        res.render("login", {
          title: "Local Library - Log In",
          error_msg: error_message,
        });
      }
    );
  },
];

// Handle user logout
exports.user_logout_post = function (req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie(process.env.SESS_NAME);
    res.redirect("/catalog");
  });
};

// Display user delete
exports.user_delete_get = function (req, res, next) {
  User.findById(req.session.userId, (err, user) => {
    if (err) {
      return next(err);
    }
    res.render("user_delete", {
      user: user,
    });
  });
};

// Handle user delete
exports.user_delete_post = function (req, res, next) {
  User.findByIdAndDelete(req.session.userId, (err, user) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      res.clearCookie(process.env.SESS_NAME);
      res.redirect("/catalog");
    });
  });
};

// Redirect to login
exports.redirectLogin = function (req, res, next) {
  if (!req.session.userId) {
    res.redirect("/users/login");
  } else {
    next();
  }
};

// Redirect to catalog home
exports.redirectCatalog = function (req, res, next) {
  if (req.session.userId) {
    res.redirect("/catalog");
  } else {
    next();
  }
};
