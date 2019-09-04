'use strict';

exports.longCookie = function* (ctx) {
  ctx.session = {
    userId: '123',
    description: new Buffer(4900).fill(49).toString(),
  };
  ctx.body = ctx.session;
};
