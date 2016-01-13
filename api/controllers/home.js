/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.render('home', {
    application: 'Guitar Party',
    title: 'Home',
    user: req.user
  });
};
