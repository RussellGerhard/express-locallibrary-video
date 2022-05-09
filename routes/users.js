var express = require('express');
var router = express.Router();

var User = require('../models/user');
var user_auth_controller = require('../controllers/userAuthController');

/// USER AUTH ROUTES ///

// GET user registration form
router.get("/register", user_auth_controller.user_register_get);

// POST user registration form
router.post("/register", user_auth_controller.user_register_post);

// GET user login page
router.get("/login", user_auth_controller.redirectCatalog, user_auth_controller.user_login_get);

// POST user login page
router.post("/login", user_auth_controller.redirectCatalog, user_auth_controller.user_login_post);

// POST user logout
router.post("/logout", user_auth_controller.redirectLogin, user_auth_controller.user_logout_post);

// GET user delete
router.get("/delete", user_auth_controller.redirectLogin, user_auth_controller.user_delete_get);

// POST user delete
router.post("/delete", user_auth_controller.redirectLogin, user_auth_controller.user_delete_post);

module.exports = router;