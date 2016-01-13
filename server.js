'use strict';

/*---------------------|
 * Module dependencies |
 *---------------------*/

// Express framework
var express = require('express');

// core modules & libs
var path = require('path');
var fs   = require('fs');
var http = require('http');

// Middlewares
var csrf              = require('csurf');
var favicon           = require('serve-favicon');
var session           = require('express-session');
var compress          = require('compression');
var bodyParser        = require('body-parser');
var passport          = require('passport');
var logger            = require('morgan');
var helmet            = require('helmet');
var semver            = require('semver');
var errorHandler      = require('errorhandler');
var enforce           = require('express-sslify');
var expressValidator  = require('express-validator');

// Database & ODM
var MongoStore = require('connect-mongo')(session);
var mongoose   = require('mongoose'),
    song = require('./api/models/Song'),
    repertoire = require('./api/models/Repertoire'),
    user = require('./api/models/User');

// Express app & config keys
var app = express();
var config = require('./config/index.js');
console.log(config);
// Passport oAuth Middleware
// Passport OAUTH Middleware
app.use(passport.initialize());
app.use(passport.session());

/*-----------------------------------|
 * Set MongoDB Connection & Sessings |
 *----------------------------------*/

mongoose.connect(config.mongodb.url);
var db = mongoose.connection;

// Use Mongo for session store
config.session.store  = new MongoStore({
  mongooseConnection: db,
  autoReconnect: true
});

/*---------------------------|
 * Environment Configuration |
 *--------------------------*/

const PORT = process.env.PORT || 5000;

if (app.get('env') === 'development') {
  app.locals.pretty = true; // Jade options
  app.locals.compileDebug = true;
  
  app.use(logger('dev'));
  app.use(helmet.nocache());
}

if (app.get('env') === 'production') {  
  app.locals.pretty = false;
  app.locals.compileDebug = false;

  // Security middlewares, used behind nginx, proxy, or a load balancer (e.g. Heroku, Nodejitsu)
  app.enable('trust proxy', 1);
  app.use(enforce.HTTPS(true));
  
  var ninetyDaysInMilliseconds = 7776000000;
  app.use(helmet.hsts({ maxAge: ninetyDaysInMilliseconds }));

  // Turn on HTTPS/SSL cookies
  config.session.proxy = true;
  config.session.cookie.secure = true;
}

/*----------------------------------|
 * Express Middleware Configuration |
 *---------------------------------*/

app.set('env', process.env.NODE_ENV);
app.set('port', process.env.PORT || PORT);

app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname, 'views', 'partials'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public', { maxAge: 604800000 })); // week

app.use(compress());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator()); // easy form validation

// Use sessions
// NOTE: cookie-parser not needed with express-session > v1.5
app.use(session(config.session));

// Logging
var logFile = fs.createWriteStream('./logs/' + new Date().getTime().log, { flags: 'a' });
app.use(logger('combined', { stream: logFile }));

// Security Settings
app.disable('x-powered-by');         // Don't advertise our server type
app.use(csrf());                     // Prevent Cross-Site Request Forgery
app.use(helmet.ienoopen());          // X-Download-Options for IE8+
app.use(helmet.nosniff());           // Sets X-Content-Type-Options to nosniff
app.use(helmet.xssFilter());         // sets the X-XSS-Protection header
app.use(helmet.frameguard('deny'));  // Prevent iframe clickjacking

/*---------|
 * Routers |
 *---------*/

/* TODO
 *
 * Examples:

 var api  = require('./api/routes/');

 */

var auth = require('./api/routes/auth');

/*------------|
 * Api Routes |
 *-----------*/

app.get('/', require('./api/controllers/home').index);
app.use(auth);
//app.get('/logout', require('./api/controllers/userController'));

/*----------------|
 * Error Handlers |
 *---------------*/

// Handle 404 Errors
app.use(function (req, res, next) {
  res.status(404);
  console.log('404 Warning. URL: ' + req.url);

  // Respond with html page
  if (req.accepts('html')) {
    res.render('error/404', {
      url: req.url,
      application: 'Guitar Party'
    });
    return;
  }

  // Respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found!' });
    return;
  }

  // Default to plain-text. send()
  res.type('txt').send('Error: Not found!');

});

// Handle 403 Errors
app.use(function (err, req, res, next) {
  if (err.status === 403) {
    res.status(err.status);
    console.log('403 Not Allowed. URL: ' + req.url + ' Err: ' + err);

    // Respond with HTML
    if (req.accepts('html')) {
      res.render('error/403', {
        error: err,
        application: 'Guitar Party',
        url: req.url
      });
      return;
    }

    // Respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not Allowed!' });
      return;
    }

    // Default to plain-text. send()
    res.type('txt').send('Error: Not Allowed!');

  } else {
    // Since the error is not a 403 pass it along
    return next(err);
  }
});

// Production 500 error handler (no stacktraces leaked to public!)
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log('Error: ' + (err.status || 500).toString() + ' ' + err);
    res.render('error/500', {
      error: {}  // don't leak information
    });
  });
}

// Development 500 error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log('Error: ' + (err.status || 500).toString() + ' ' + err);
    res.render('error/500', {
      error: err
    });
  });

  // Final error catch-all just in case...
  app.use(errorHandler());
}

/*---------------------------------------------------|
 * Create Express app, server and MongoDB Connection |
 *--------------------------------------------------*/

db.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(0);
});

db.on('open', function () {
  console.log('Mongodb ' + 'connected!');
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
