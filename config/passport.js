'use strict';

/**
 * Module dependencies.
 */

var _                 = require('lodash');
var User              = require('../models/User');
var utils             = require('./utils');
var config            = require('./config');
var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy  = require('passport-facebook').Strategy;

/**
 * Serialize and Deserialize the User
 */

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/**
 * Local authentication
 */

// Use the LocalStrategy within Passport.
//   Strategies in passport accept credentials (in this case, a username and password),
//   and invoke a callback with a user object.

passport.use(new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
  User.findOne({ email: email }, function (err, user) {
    if (!user) {
      return done(null, false, { message: 'Invalid email or password.' });
    }

    if (user && user.authenticate(password)) {
      return done(null, user);
    }
    else {
      return done(null, false, { message: 'Your account must be verified first!' });
    }

    //// Only authenticate if the user is verified
    //if (user.verified) {
    //  user.comparePassword(password, function (err, isMatch) {
    //    if (isMatch) {
    //
    //      // update the user's record with login timestamp
    //      user.activity.last_logon = Date.now();
    //      user.save(function (err) {
    //        if (err) {
    //          return (err);
    //        }
    //      });
    //
    //      return done(null, user);
    //    } else {
    //      return done(null, false, { message: 'Invalid email or password.' });
    //    }
    //  });
    //} else {
    //  return done(null, false, { message: 'Your account must be verified first!' });
    //}
  });
}));

/**
 * Sign in with Facebook.
 */

passport.use('facebook', new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  scope: ['email', 'user_location']
}, function (accessToken, refreshToken, profile, done) {
  done(null, false, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });
}));

/**
 * Sign in with Google. (OAuth 2.0)
 */

passport.use('google', new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  scope: ['profile email']  // get the user's email address
}, function (accessToken, refreshToken, profile, done) {
  done(null, false, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });
}));

/**
 * Login Required middleware.
 */

exports.isAuthenticated = function (req, res, next) {
  // Is the user authenticated?
  if (req.isAuthenticated()) {
    // Does the user have enhanced security enabled?
    if (req.user.enhancedSecurity.enabled) {
      // If we already have validated the second factor it's
      // a noop, otherwise redirect to capture the OTP.
      if (req.session.passport.secondFactor === 'validated') {
        return next();
      } else {
        // Verify their OTP code
        res.redirect('/verify-setup');
      }
    } else {
      // If enhanced security is disabled just continue.
      return next();
    }
  } else {
    req.session.attemptedURL = req.url;  // Save URL so we can redirect to it after authentication
    res.set('X-Auth-Required', 'true');
    req.flash('error', { msg: 'You must be logged in to reach that page.' });
    res.redirect('/login');
  }
};

/**
 * Authorization Required middleware.
 */

exports.isAuthorized = function (req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if (_.find(req.user.tokens, { kind: provider })) {
    // we found the provider so just continue
    next();
  } else {
    // we have to get authorized first
    if (provider === 'facebook' || provider === 'twitter' || provider === 'github' || provider === 'google') {
      req.flash('info', { msg: 'You must connect ' + utils.capitalize(provider) + ' first!' });
      res.redirect('/account');
    } else {
      res.redirect('/auth/' + provider);
    }
  }
};

/**
 * Check if the account is an Administrator
 */

exports.isAdministrator = function (req, res, next) {
  // make sure we are logged in first
  if (req.isAuthenticated()) {
    // user must be be an administrator
    if (req.user.type !== 'admin') {
      req.flash('error', { msg: 'You must be an Administrator reach that page.' });
      return res.redirect('/api');
    } else {
      return next();
    }
  } else {
    req.flash('error', { msg: 'You must be logged in to reach that page.' });
    res.redirect('/login');
  }
};

/**
 * Redirect to HTTPS (SSL) connection
 *
 * Good middleware for login forms, etc.
 * Not currently used since we are directing
 * *all* traffic to ssl in production
 */

exports.isSecure = function (req, res, next) {
  // Reroute HTTP traffic to HTTPS
  if ((req.secure) || (req.headers['x-forwarded-proto'] === 'https')) {
    return next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
};
