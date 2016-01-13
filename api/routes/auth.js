'use strict';

/**
 * Door-router for users :)
 * @namespace '/'
 * @access 'public'
 **/

var express = require('express'),
    router  = express.Router(),
    userController = require('../controllers/userController'),
    auth = require('../../config/auth');

router
  .get('/login', userController.loginIndex)
  .post('/login', auth.login)
  .get('/register', userController.registerIndex)
  .post('/api/users',  userController.createUser);
  //.get('/logout',  userController.logout)
  //.get('/signup',  userController.getSignup)
  //.post('/signup', userController.postSignup);

module.exports = router;
