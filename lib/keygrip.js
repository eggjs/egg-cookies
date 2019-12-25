'use strict';

// because node v11.0.0 DEP0106: crypto.createCipher and crypto.createDecipher
// so using crypto.createCipheriv crypto.createDecipheriv instead
// and making compatible with lower version
const process = require('process');
const debug = require('debug')('egg-cookies:keygrip');
const crypto = require('crypto');
const assert = require('assert');
const constantTimeCompare = require('scmp');

const excNewCipherNodeVer = '11.0.0'; // node 11.0.0 version runtime using crypto.createCipheriv,crypto.createDecipheriv instead
const replacer = {
  '/': '_',
  '+': '-',
  '=': '',
};

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

// patch from https://github.com/crypto-utils/keygrip

class Keygrip {
  constructor(keys) {
    assert(Array.isArray(keys) && keys.length, 'keys must be provided and should be an array');
    keys.forEach(key => {
      assert(isObject(key) || typeof (key) === 'string', 'each of Keys is either object or string');
      if (isObject(key)) {
        assert(typeof (key.key) === 'string' && key.key.length === 32, 'if the Key is object,key property must be privided with a string of 32 length');
        assert(typeof (key.iv) === 'string' && key.iv.length === 16, 'if the Key is object,iv property must be privided with a string of 16 length');
      }
    });

    this.nodeVer = process.versions.node;
    this.keys = keys;
    this.hash = 'sha256';
    this.cipher = 'aes-256-cbc';
  }

  // encrypt a message

  encrypt(data, key) {
    key = key || this.keys[0];
    const cipher = process.versions.node >= excNewCipherNodeVer && isObject(key) ? crypto.createCipheriv(this.cipher, key.key, key.iv) : crypto.createCipher(this.cipher, key);
    return crypt(cipher, data);
  }

  // decrypt a single message
  // returns false on bad decrypts

  decrypt(data, key) {
    if (!key) {
      // decrypt every key
      const keys = this.keys;
      for (let i = 0; i < keys.length; i++) {
        const value = this.decrypt(data, keys[i]);
        if (value !== false) return { value, index: i };
      }
      return false;
    }

    try {
      const cipher = process.versions.node >= excNewCipherNodeVer && isObject(key) ? crypto.createDecipheriv(this.cipher, key.key, key.iv) : crypto.createDecipher(this.cipher, key);
      return crypt(cipher, data);
    } catch (err) {
      debug('crypt error', err.stack);
      return false;
    }
  }

  sign(data, key) {
    // default to the first key

    key = key || (isObject(this.keys[0]) ? this.keys[0].key : this.keys[0]);
    return crypto
      .createHmac(this.hash, key)
      .update(data)
      .digest('base64')
      .replace(/\/|\+|=/g, x => replacer[x]);
  }

  verify(data, digest) {
    const keys = this.keys;
    for (let i = 0; i < keys.length; i++) {
      const key = isObject(keys[i]) ? keys[i].key : keys[i];
      if (constantTimeCompare(Buffer.from(digest), Buffer.from(this.sign(data, key)))) {
        debug('data %s match key %s', data, key);
        return i;
      }
    }
    return -1;
  }
}

function crypt(cipher, data) {
  const text = cipher.update(data, 'utf8');
  const pad = cipher.final();
  return Buffer.concat([ text, pad ]);
}

module.exports = Keygrip;
