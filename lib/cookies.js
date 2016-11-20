'use strict';

const assert = require('assert');
const utility = require('utility');
const Keygrip = require('./keygrip');
const Cookie = require('./cookie');

/**
 * cookies for egg
 * extend pillarjs/cookies, add encrypt and decrypt
 */

class Cookies {
  constructor(ctx, keys) {
    assert(Array.isArray(keys), 'keys must be an array');
    this.keys = new Keygrip(keys);

    this.ctx = ctx;
    this.secure = this.ctx.secure;
  }

  /**
   * get cookie value by name
   * @param  {String} name - cookie's name
   * @param  {Object} opts - cookies' options
   *            - {Boolean} signed - defualt to true
   *            - {Boolean} encrypt - defualt to false
   * @return {String} value - cookie's value
   */
  get(name, opts) {
    opts = encryptOrSigned(opts);

    const header = this.ctx.get('cookie');
    if (!header) return;

    const match = header.match(getPattern(name));
    if (!match) return;

    let value = match[1];
    if (!opts.encrypt && !opts.signed) return value;
    // signed
    if (opts.signed) {
      const sigName = name + '.sig';
      const sigValue = this.get(sigName, { signed: false });
      if (!sigValue) return;

      const raw = name + '=' + value;
      const index = this.keys.verify(raw, sigValue);
      if (index < 0) {
        // can not match any key, remove ${name}.sig
        this.set(sigName, null, { path: '/', signed: false });
        return;
      }
      if (index > 0) {
        // not signed by the first key, update sigValue
        this.set(sigName, this.keys.sign(raw), { signed: false });
      }
      return value;
    }

    // encrypt
    value = utility.base64decode(value, true, 'buffer');
    const res = this.keys.decrypt(value);
    return res ? res.value.toString() : undefined;
  }

  set(name, value, opts) {
    opts = encryptOrSigned(opts);
    if (!this.secure && opts.secure) {
      throw new Error('Cannot send secure cookie over unencrypted connection');
    }
    if (opts.secure === undefined) opts.secure = this.secure;

    let headers = this.ctx.response.get('set-cookie') || [];

    // encrypt
    if (opts.encrypt) {
      value = utility.base64encode(this.keys.encrypt(value), true);
    }
    const cookie = new Cookie(name, value, opts);
    headers = pushCookie(headers, cookie);

    // signed
    if (opts.signed) {
      cookie.value = this.keys.sign(cookie.toString());
      cookie.name += '.sig';
      headers = pushCookie(headers, cookie);
    }

    this.ctx.set('set-cookie', headers);
    return this;
  }
}

const cache = new Map();
function getPattern(name) {
  if (cache.has(name)) return cache.get(name);
  const reg = new RegExp(
    '(?:^|;) *' +
    name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') +
    '=([^;]*)'
  );
  cache.set(name, reg);
  return reg;
}

function encryptOrSigned(opts) {
  opts = opts || {};
  // encrypt default to false, signed default to true.
  // disable singed when encrypt is true.
  if (opts.encrypt) opts.signed = false;
  if (opts.signed !== false) opts.signed = true;
  return opts;
}

function pushCookie(cookies, cookie) {
  if (cookie.attrs.overwrite) {
    cookies = cookies.filter(c => !c.startsWith(cookie.name + '='));
  }
  cookies.push(cookie.toHeader());
  return cookies;
}

module.exports = Cookies;
