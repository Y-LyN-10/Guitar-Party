var encryptor = require('../helpers/encryptor');
var passport = require('passport');
var User = require('mongoose').model('User'),
    Repertoire = require('mongoose').model('Repertoire'),
    Song = require('mongoose').model('Song'),
    DEFAULT_PAGE_SIZE = 10,
    DEFAULT_PAGE = 1;

module.exports = {
    loginIndex: function(req, res) {
        res.render('logIn', {
            application: 'Guitar Party',
            title: 'Login'
        })
    },
    registerIndex: function(req, res) {
        res.render('signUp', {
            application: 'Guitar Party',
            title: 'Sign Up'
        })
    },
    userDetailsIndex: function(req, res) {
        res.render('userDetails', {
            application: 'Guitar Party',
            title: 'User Details',
            user: req.user
        });
    },
    createUser: function (req, res, next) {
        var newUserData;
        if(req.body.models){
            newUserData  = req.body.models[0]
        } else {
            newUserData = req.body;
        }

        if (!Object.keys(newUserData).length) {
            return res.status(400)
                .send({message: 'The request is not valid!'});
        }

        newUserData.salt = encryptor.generateSalt();
        newUserData.hashPass = encryptor.generateHash(newUserData.salt, newUserData.password);
        User.create(newUserData, function (err, user) {
            if (err) {
                console.log('Failed to register new user: ' + err);
                return;
            }

            req.logIn(user, function (err) {
                if (err) {
                    res.status(400);
                    return res.send({reason: err.toString()});
                }

                res.redirect('/login');
            })
        });
    },
    logUser: function(req, res, next) {
        var auth = passport.authenticate('local', function(err, user) {
            if (err) return next(err);
            if (!user) {
                res.send({success: false})
            }
            req.logIn(user, function(err) {
                if (err) return next(err);
                res.redirect('/');
                //res.send({success: true, user: user});
            })
        })(req, res, next);
    },
    logOutUser: function(req, res, next) {
        req.logout();
        res.redirect('/');
    },
    isAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
            var error = new Error('Unauthorized');
            error.status = 403;
            next(error);
        }
        else {
            next();
        }
    },
    isInRole: function(role) {
        return function(req, res, next) {
            if (req.isAuthenticated() && req.user.roles.indexOf(role) > -1) {
                next();
            }
            else {
                var error = new Error('Unauthorized');
                error.status = 403;
                next(error);
            }
        }
    },
    updateUser: function (req, res, next) {
        if (req.user._id == req.body._id || req.user.roles.indexOf('admin') > -1) {
            var updatedUserData = req.body;
            if (updatedUserData.password && updatedUserData.password.length > 0) {
                updatedUserData.salt = encryptor.generateSalt();
                updatedUserData.hashPass = encryptor.generateHash(updatedUserData.salt, updatedUserData.password);
            }

            User.update({_id: req.body._id}, updatedUserData, function () {
                res.end();
            })
        }
        else {
            res.send({reason: 'You do not have permissions!'})
        }
    },
    getAllUsers: function (req, res, next) {
        User.find({}).exec(function (err, collection) {
            if (err) {
                console.log('Get all users failed: ' + err);
                next(err);
            }

            res.send(collection);
        })
    },
    getUserDetails: function (req, res) {
        User
            .find({_id: req.params.id})
            .exec(function (err, user) {
                if (err) {
                    console.log('Get user details failed: ' + err);
                    return;
                }

                Repertoire
                    .find({_id: {$in: user[0].repertoire}})
                    .exec(function (err, repertoire) {
                        if (err) {
                            console.log('Get user repertoire failed: ' + err);
                            details.repertoire = {};
                        }

                        Song
                            .find({_id: {$in: user[0].songs}})
                            .skip(((req.query.page || DEFAULT_PAGE) -1) * DEFAULT_PAGE_SIZE)
                            .limit(DEFAULT_PAGE_SIZE)
                            .exec(function (err, songs) {
                                if (err) {
                                    console.log('Get user songs failed: ' + err);
                                }

                                res.render('../views/users/userDetails', {
                                    user: user[0],
                                    currentUser: req.user,
                                    userRepertoire: repertoire,
                                    userSongs: songs
                                });
                            });
                    });
            });

    },
    deleteUser: function (req, res) {
        var id;
        if(req.body._id){
            id = req.body._id
        }
        else{
            id = req.params.id
        }

        if (req.user.roles.indexOf('admin') > -1) {
            User.remove({_id: id}, function (err, user) {
                if (err) {
                    console.log('Delete user by id failed: ' + err);
                    return;
                }

                res.status(202).send(user);
                res.end();
            });
        }
        else {
            res.send({reason: 'You do not have permissions!'})
        }
    }
};