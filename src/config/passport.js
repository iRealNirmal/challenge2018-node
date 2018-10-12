const passport = require('passport');
require('./strategies/local.strategy')();
const session = require('express-session');

module.exports = function passportConfig(app) {



  // store user session
  passport.serializeUser((user, done) => {
    console.log('serialize'+user);
    done(null, user);
  });

  // retrive user session
  passport.deserializeUser((user, done) => {
    console.log('deserialize'+user);
    done(null, user);
  });
};
