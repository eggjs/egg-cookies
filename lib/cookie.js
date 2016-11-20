'use strict';

const assert = require('assert');

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

const defaultAttrs = {
  path: '/',
  expires: undefined,
  domain: undefined,
  httpOnly: true,
  secure: false,
  overwrite: false,
};

class Cookie {
  constructor(name, value, attrs) {
    assert(fieldContentRegExp.test(name), 'argument name is invalid');
    assert(fieldContentRegExp.test(value), 'argument value is invalid');

    this.name = name;
    this.value = value || '';
    this.attrs = Object.assign({}, defaultAttrs, attrs);

    assert(!this.attrs.path || fieldContentRegExp.test(this.attrs.path), 'argument option path is invalid');
    assert(!this.attrs.domain || fieldContentRegExp.test(this.attrs.domain), 'argument option domain is invalid');

    if (value && !this.attrs.expires) this.attrs.expires = new Date(0);
  }

  toString() {
    return this.name + '=' + this.value;
  }

  toHeader() {
    let header = this.toString();
    const attrs = this.attrs;
    if (attrs.maxAge) attrs.expires = new Date(Date.now() + attrs.maxAge);
    if (attrs.path) header += '; path=' + attrs.path;
    if (attrs.expires) header += '; expires=' + attrs.expires.toUTCString();
    if (attrs.domain) header += '; domain=' + attrs.domain;
    if (attrs.secure) header += '; secure';
    if (attrs.httpOnly) header += '; httponly';

    return header;
  }
}

module.exports = Cookie;
