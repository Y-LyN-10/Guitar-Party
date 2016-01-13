'use strict';

/**
 * Door-router for users :)
 * @namespace '/'
 * @access 'public'
 **/

var express = require('express'),
    router  = express.Router(),

    userController = require('../controllers/userController');

router
  .get('/login',   userController.getLogin)
  .post('/login',  userController.postLogin)
  .get('/logout',  userController.logout)
  .get('/signup',  userController.getSignup)
  .post('/signup', userController.postSignup);

module.exports = router;
