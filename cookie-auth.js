'use strict';

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
  console.log('checking cookies');
  console.log(req.cookies);
  if(req.cookies.hasOwnProperty('hearthstone_token')) {
    jwt.verify(token, PRIATE_KEY, (err, decoded) => { 
      if(err) return next(res.render('pages/login'));
      req.userid = decoded.userid;
      next();
    });
  }
  else {
    return next(res.render('pages/login'));
  }
};