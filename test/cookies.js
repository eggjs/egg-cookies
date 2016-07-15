'use strict';

const Cookies = require('..');
const Keygrip = require('./keygrip');

module.exports = (req, options) => {
  options = options || {};
  let keys = options.keys;
  const ctx = { secure: options.secure };
  ctx.req = Object.assign({
    connection: {},
    headers: {},
  }, req);

  ctx.res = {
    headers: {},
    getHeader(key) {
      return this.headers[key];
    },
    setHeader(key, value) {
      this.headers[key] = value;
    },
  };

  if (keys !== false) {
    keys = keys || new Keygrip([ 'key', 'keys' ]);
  }

  return new Cookies(ctx, keys);
};
