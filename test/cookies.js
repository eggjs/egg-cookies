'use strict';

const Cookies = require('..');

module.exports = (req, options) => {
  options = options || {};
  let keys = options.keys;
  const ctx = { secure: options.secure };
  ctx.request = Object.assign({
    headers: {},
    get(key) {
      return this.headers[key];
    },
  }, req);

  ctx.response = {
    headers: {},
    get(key) {
      return this.headers[key];
    },
    set(key, value) {
      this.headers[key] = value;
    },
  };

  ctx.get = ctx.request.get.bind(ctx.request);
  ctx.set = ctx.response.set.bind(ctx.response);

  keys = keys || [ 'key', 'keys' ];
  return new Cookies(ctx, keys);
};
