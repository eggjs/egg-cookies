'use strict';

const assert = require('assert');
const utility = require('utility');
const _isSameSiteNoneCompatible = require('should-send-same-site-none').isSameSiteNoneCompatible;
const Keygrip = require('./keygrip');
const Cookie = require('./cookie');
const CookieError = require('./error');

const KEYS_ARRAY = Symbol('eggCookies:keysArray');
const KEYS = Symbol('eggCookies:keys');
const PARSED_UA = Symbol('eggCookies:parsedUA');
const keyCache = new Map();

/**
 * cookies for egg
 * extend pillarjs/cookies, add encrypt and decrypt
 */

class Cookies {
  constructor(ctx, keys, defaultCookieOptions) {
    this[KEYS_ARRAY] = keys;
    this._keys = keys;
    // default cookie options
    this._defaultCookieOptions = defaultCookieOptions;
    this._autoChips = defaultCookieOptions && defaultCookieOptions.autoChips;
    this.ctx = ctx;
    this.secure = this.ctx.secure;
    this.app = ctx.app;
  }

  get keys() {
    if (!this[KEYS]) {
      const keysArray = this[KEYS_ARRAY];
      assert(Array.isArray(keysArray), '.keys required for encrypt/sign cookies');
      const cache = keyCache.get(keysArray);
      if (cache) {
        this[KEYS] = cache;
      } else {
        this[KEYS] = new Keygrip(this[KEYS_ARRAY]);
        keyCache.set(keysArray, this[KEYS]);
      }
    }

    return this[KEYS];
  }

  /**
   * get cookie value by name
   * @param  {String} name - cookie's name
   * @param  {Object} opts - cookies' options
   *            - {Boolean} signed - default to true
   *            - {Boolean} encrypt - default to false
   * @return {String} value - cookie's value
   */
  get(name, opts) {
    opts = opts || {};
    let value = this._get(name, opts);
    if (value === undefined && this._autoChips) {
      // try to read _CHIPS-${name} prefix cookie
      value = this._get(this._formatChipsCookieName(name), opts);
    }
    return value;
  }

  _get(name, opts) {
    const signed = computeSigned(opts);

    const header = this.ctx.get('cookie');
    if (!header) return;

    const match = header.match(getPattern(name));
    if (!match) return;

    let value = match[1];
    if (!opts.encrypt && !signed) return value;

    // signed
    if (signed) {
      const sigName = name + '.sig';
      const sigValue = this.get(sigName, { signed: false });
      if (!sigValue) return;

      const raw = name + '=' + value;
      const index = this.keys.verify(raw, sigValue);
      if (index < 0) {
        // can not match any key, remove ${name}.sig
        this.set(sigName, null, { path: '/', signed: false, overwrite: true });
        return;
      }
      if (index > 0) {
        // not signed by the first key, update sigValue
        this.set(sigName, this.keys.sign(raw), { signed: false, overwrite: true });
      }
      return value;
    }

    // encrypt
    value = utility.base64decode(value, true, 'buffer');
    const res = this.keys.decrypt(value);
    return res ? res.value.toString() : undefined;
  }

  set(name, value, opts) {
    opts = Object.assign({}, this._defaultCookieOptions, opts);
    const signed = computeSigned(opts);
    value = value || '';
    if (!this.secure && opts.secure) {
      throw new CookieError('Cannot send secure cookie over unencrypted connection');
    }

    let headers = this.ctx.response.get('set-cookie') || [];
    if (!Array.isArray(headers)) headers = [ headers ];

    // encrypt
    if (opts.encrypt) {
      value = value && utility.base64encode(this.keys.encrypt(value), true);
    }

    // http://browsercookielimits.squawky.net/
    if (value.length > 4093) {
      this.app.emit('cookieLimitExceed', { name, value, ctx: this.ctx });
    }

    // https://github.com/linsight/should-send-same-site-none
    // fixed SameSite=None: Known Incompatible Clients
    const userAgent = this.ctx.get('user-agent');
    let isSameSiteNone = false;
    // disable autoChips if partitioned enable
    let autoChips = !opts.partitioned && this._autoChips;
    if (opts.sameSite && typeof opts.sameSite === 'string' && opts.sameSite.toLowerCase() === 'none') {
      isSameSiteNone = true;
      if (opts.secure === false || !this.secure || (userAgent && !this.isSameSiteNoneCompatible(userAgent))) {
        // Non-secure context or Incompatible clients, don't send SameSite=None property
        opts.sameSite = false;
        isSameSiteNone = false;
      }
    }
    if (autoChips || opts.partitioned) {
      // allow to set partitioned: secure=true and sameSite=none and chrome >= 118
      if (!isSameSiteNone || opts.secure === false || !this.secure || (userAgent && !this.isPartitionedCompatible(userAgent))) {
        // Non-secure context or Incompatible clients, don't send partitioned property
        autoChips = false;
        opts.partitioned = false;
      }
    }

    // remove unpartitioned same name cookie first
    if (opts.partitioned && opts.removeUnpartitioned) {
      const overwrite = opts.overwrite;
      if (overwrite) {
        opts.overwrite = false;
        headers = ignoreCookiesByName(headers, name);
      }
      const removeCookieOpts = Object.assign({}, opts, {
        partitioned: false,
      });
      const removeUnpartitionedCookie = new Cookie(name, '', removeCookieOpts);
      // if user not set secure, reset secure to ctx.secure
      if (opts.secure === undefined) removeUnpartitionedCookie.attrs.secure = this.secure;

      headers = pushCookie(headers, removeUnpartitionedCookie);
      // signed
      if (signed) {
        removeUnpartitionedCookie.name += '.sig';
        headers = ignoreCookiesByName(headers, removeUnpartitionedCookie.name);
        headers = pushCookie(headers, removeUnpartitionedCookie);
      }
    } else if (autoChips) {
      // add _CHIPS-${name} prefix cookie
      const newCookieName = this._formatChipsCookieName(name);
      const newCookieOpts = Object.assign({}, opts, {
        partitioned: true,
      });
      const newPartitionedCookie = new Cookie(newCookieName, value, newCookieOpts);
      // if user not set secure, reset secure to ctx.secure
      if (opts.secure === undefined) newPartitionedCookie.attrs.secure = this.secure;

      headers = pushCookie(headers, newPartitionedCookie);
      // signed
      if (signed) {
        newPartitionedCookie.value = value && this.keys.sign(newPartitionedCookie.toString());
        newPartitionedCookie.name += '.sig';
        headers = ignoreCookiesByName(headers, newPartitionedCookie.name);
        headers = pushCookie(headers, newPartitionedCookie);
      }
    }

    const cookie = new Cookie(name, value, opts);
    // if user not set secure, reset secure to ctx.secure
    if (opts.secure === undefined) cookie.attrs.secure = this.secure;
    headers = pushCookie(headers, cookie);

    // signed
    if (signed) {
      cookie.value = value && this.keys.sign(cookie.toString());
      cookie.name += '.sig';
      headers = pushCookie(headers, cookie);
    }

    this.ctx.set('set-cookie', headers);
    return this;
  }

  _formatChipsCookieName(name) {
    return `_CHIPS-${name}`;
  }

  _parseChromiumAndMajorVersion(userAgent) {
    if (!this[PARSED_UA]) {
      this[PARSED_UA] = parseChromiumAndMajorVersion(userAgent);
    }
    return this[PARSED_UA];
  }

  isSameSiteNoneCompatible(userAgent) {
    // Chrome >= 80.0.0.0
    const result = this._parseChromiumAndMajorVersion(userAgent);
    if (result.chromium) return result.majorVersion >= 80;
    return _isSameSiteNoneCompatible(userAgent);
  }

  isPartitionedCompatible(userAgent) {
    // support: Chrome >= 114.0.0.0
    // default enable: Chrome >= 118.0.0.0
    // https://developers.google.com/privacy-sandbox/3pcd/chips
    const result = this._parseChromiumAndMajorVersion(userAgent);
    if (result.chromium) return result.majorVersion >= 118;
    return false;
  }
}

// https://github.com/linsight/should-send-same-site-none/blob/master/index.js#L86
function parseChromiumAndMajorVersion(userAgent) {
  const m = /Chrom[^ \/]{1,100}\/(\d{1,100}?)\./.exec(userAgent);
  if (!m) return { chromium: false, version: null };
  // Extract digits from first capturing group.
  return { chromium: true, majorVersion: parseInt(m[1]) };
}

const _patternCache = new Map();
function getPattern(name) {
  const cache = _patternCache.get(name);
  if (cache) return cache;
  const reg = new RegExp(
    '(?:^|;) *' +
    name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') +
    '=([^;]*)'
  );
  _patternCache.set(name, reg);
  return reg;
}

function computeSigned(opts) {
  // encrypt default to false, signed default to true.
  // disable singed when encrypt is true.
  if (opts.encrypt) return false;
  return opts.signed !== false;
}

function pushCookie(cookies, cookie) {
  if (cookie.attrs.overwrite) {
    cookies = ignoreCookiesByName(cookies, cookie.name);
  }
  cookies.push(cookie.toHeader());
  return cookies;
}

function ignoreCookiesByName(cookies, name) {
  const prefix = `${name}=`;
  return cookies.filter(c => !c.startsWith(prefix));
}

Cookies.CookieError = CookieError;
module.exports = Cookies;
