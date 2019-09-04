'use strict';

module.exports = function(app) {
  app.get('/long-cookie', 'home.longCookie');
};
