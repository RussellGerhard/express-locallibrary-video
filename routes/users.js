var express = require("express");
var router = express.Router();

var user_controller = require("../controllers/userController");

// GET user register
router.get("/register", user_controller.user_register_get);

// POST user register
router.post("/register", user_controller.user_register_post);

// GET user login
router.get("/login", user_controller.user_login_get);

// POST user login
router.post("/login", user_controller.user_login_post);

// POST user logout
router.post("/logout", user_controller.user_logout_post);

// GET user delete
router.post("/delete", user_controller.user_delete_get);

// POST user delete
router.post("/delete", user_controller.user_delete_post);

module.exports = router;
