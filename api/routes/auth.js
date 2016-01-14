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
  .get('/login', userController.loginIndex)
  .post('/login', userController.logUser)
  .get('/register', userController.registerIndex)
  .post('/api/users',  userController.createUser)
  .post('/logout',  userController.logOutUser);
  //.get('/signup',  userController.getSignup)
  //.post('/signup', userController.postSignup);

module.exports = router;
