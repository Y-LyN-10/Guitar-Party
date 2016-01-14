(function () {
    'use strict';

    function authService($http, $q, identity, UsersResource) {
        return {
            update: function(user) {
                var deferred = $q.defer();

                var updatedUser = new UsersResource(user);
                updatedUser._id = identity.currentUser._id;
                updatedUser.$update().then(function() {
                    identity.currentUser = user;
                    deferred.resolve();
                }, function(response) {
                    deferred.reject(response);
                });

                return deferred.promise;
            },
            isAuthenticated: function() {
                if (identity.isAuthenticated()) {
                    return true;
                }
                else {
                    return $q.reject('not authorized');
                }
            },
            isAuthorizedForRole: function(role) {
                if (identity.isAuthorizedForRole(role)) {
                    return true;
                }
                else {
                    return $q.reject('not authorized');
                }
            }
        }
    }

    angular
        .module('app.services')
        .factory('auth', ['$http', '$q', 'identity', 'UsersResource', authService]);
}());