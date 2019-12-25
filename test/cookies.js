'use strict';

const Cookies = require('..');
const EventEmitter = require('events');


module.exports = (req, options, defaultCookieOptions) => {
  options = options || {};
  let keys = options.keys;
  keys = keys === undefined ? [ 'key', 'keys' ] : keys;
  const ctx = { secure: options.secure };
  ctx.app = new EventEmitter();
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

  return new Cookies(ctx, keys, defaultCookieOptions);
};
