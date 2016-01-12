'use strict';

/**
 * Router for API routers for routes ))
 * @namespace '/api'
 **/

var
   express = require('express'),
   router  = express.Router(),

   userRoutes = require('./user'),
   taskRoutes = require('./task'),
   solutionRoutes = require('./solution'),
   projectRoutes  = require('./project');

router
  .use('/tasks', taskRoutes)
  .use('/users', userRoutes)
  .use('/solutions', solutionRoutes)
  .use('/projects', projectRoutes);

module.exports = router;
