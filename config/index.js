'use strict';

var config = {};

// Logging Configuration
config.logging = process.env.LOGGING || false;

// Database Configuration
config.mongodb      = {};
config.mongodb.url  = process.env.MONGODB_URL || 'localhost';

// Session Configuration
var week = ((3600000 * 24) * 7);

// Session
config.session                 = {};
config.session.secret          = process.env.SESSION_SECRET || 'huge secret';
config.session.name            = 'sid';  // Generic - don't leak information
config.session.proxy           = false;  // Trust the reverse proxy for HTTPS/SSL
config.session.resave          = false;  // Forces session to be saved even when unmodified
config.session.saveUninitialized = false; // forces a session that is "uninitialized" to be saved to the store
config.session.cookie          = {};
config.session.cookie.httpOnly = true;   // Reduce XSS attack vector
config.session.cookie.secure   = false;  // Cookies via HTTPS/SSL
config.session.cookie.maxAge   = process.env.SESSION_MAX_AGE || week;
/**
 * Throttle Login Attempts
 */

config.loginAttempts           = {};
config.loginAttempts.forIp     = 50;
config.loginAttempts.forUser   = 5;
config.loginAttempts.expires   = '20m';

/**
 * Mailing Configuration
 */

// Who are we sending email as?
config.smtp                    = {};
config.smtp.name               = process.env.SMTP_FROM_NAME    || 'support';
config.smtp.address            = process.env.SMTP_FROM_ADDRESS || 'support@skeleton.com';

// How are we sending it?
config.gmail                   = {};
config.gmail.user              = process.env.SMTP_USERNAME || 'you@gmail.com';
config.gmail.password          = process.env.SMTP_PASSWORD || 'appspecificpassword';

/**
 * Authorization Configuration
 */

config.localAuth               = true;
config.verificationRequired    = false;  // on/off for user email verification at signup
config.enhancedSecurity        = true;   // on/off for two factor authentication

module.exports = config;
