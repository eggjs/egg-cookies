'use strict';

module.exports = function(app) {
  app.on('cookieLimitExceed', ({ ctx, name, value }) => {
    ctx.coreLogger.warn('[cookieLimitExceed] key(%s) value(%j)', name, value);
    ctx.throw(500, 'cookie limit exceeded: ' + name);
  });
};
