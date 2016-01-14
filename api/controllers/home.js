/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  console.log(req.user);
  console.log(req.isAuthenticated());
  console.log(req.session.user);
  res.render('home', {
    application: 'Guitar Party',
    title: 'Home',
    user: req.user
  });
};
