'use strict';

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
  console.log('checking cookies');
  console.log(req.cookies);
  if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty('hearthstone_token')) {
    jwt.verify(req.cookies.hearthstone_token, process.env.PRIVATE_KEY, (err, decoded) => {
      if(err) res.redirect('/');
      else {req.userid = decoded.userid;
        next();
      }
    });
  }
  else {
    res.redirect('/');
  }
};