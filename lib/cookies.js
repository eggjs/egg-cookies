'use strict';

const Cookies = require('cookies');
const utility = require('utility');

/**
 * cookies for egg
 * extend pillarjs/cookies, add encrypt and decrypt
 */
class EggCookies extends Cookies {
  constructor(ctx, keys) {
    super(ctx.req, ctx.res, {
      keys,
      secure: ctx.secure,
    });
  }

  get(name, opts) {
    // 默认不开启 encrypt
    const encrypt = opts && opts.encrypt;

    // signed 和 encrypt 不同时开启
    if (encrypt) {
      opts.signed = false;
    }

    let value = super.get(name, opts);

    if (value && encrypt) {
      this.assertKeys();
      value = utility.base64decode(value, true, 'buffer');
      const msg = this.keys.decrypt(value);
      value = msg ? msg[0].toString('utf8') : undefined;
    }

    return value;
  }

  set(name, value, opts) {
    const encrypt = opts && opts.encrypt;

    // signed 和 encrypt 不需要同时开启
    if (value && encrypt) {
      opts.signed = false;
      this.assertKeys();
      value = utility.base64encode(this.keys.encrypt(value), true);
    }
    return super.set(name, value, opts);
  }

  assertKeys() {
    if (!this.keys) {
      throw new TypeError('.keys required for encrypt cookies');
    }
  }
}

module.exports = EggCookies;
