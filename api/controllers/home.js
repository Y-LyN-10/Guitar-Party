/**
 * GET /
 * Home page.
 */
exports.index = function(req, res, next) {
  res.render('home', {
    application: 'Guitar Party',
    title: 'Home',
    user: req.user
  });
};
