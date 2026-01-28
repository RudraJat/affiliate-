const express = require('express');
const authController = require('../controller/authController');
const router = express.Router(); // Instance of Router

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/is-user-logged-in', authController.isUserLoggedIn);
router.post('/google-login', authController.googleAuth);
router.post('/register', authController.register)

module.exports = router;

