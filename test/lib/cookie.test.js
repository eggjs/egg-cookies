'use strict';

const Cookie = require('../../lib/cookie');
const assert = require('power-assert');

describe('test/lib/cookie.test.js', () => {
  it('create cookies contains invalid string error should throw', () => {
    assert(shouldThrow(() => new Cookie('中文', 'value')) === 'argument name is invalid');
    assert(shouldThrow(() => new Cookie('name', '中文')) === 'argument value is invalid');
    assert(shouldThrow(() => new Cookie('name', 'value', { path: '中文' })) === 'argument option path is invalid');
    assert(shouldThrow(() => new Cookie('name', 'value', { domain: '中文' })) === 'argument option domain is invalid');
  });

  it('toString() return name=vaule', () => {
    assert(new Cookie('name', 'value').toString() === 'name=value');
  });

  it('toHeader() return name=vaule;params', () => {
    assert(new Cookie('name', 'value', {
      secure: true,
      maxAge: 1000,
      domain: 'eggjs.org',
      path: '/',
      httpOnly: true,
    }).toHeader().match(/^name=value; path=\/; expires=(.*?)GMT; domain=eggjs\.org; secure; httponly$/));
  });

  it('toHeader() donnot set path when set path to null', () => {
    const header = new Cookie('name', 'value', {
      path: null,
    }).toHeader();
    assert(!header.match(/path=/));
  });

  it('toHeader() donnot set httponly when set httpOnly to false', () => {
    const header = new Cookie('name', 'value', {
      httpOnly: false,
    }).toHeader();
    assert(!header.match(/httponly/));
  });

  it('maxAge overwrite expires', () => {
    const expires = new Date('2020-01-01');
    console.log(expires);
    let header = new Cookie('name', 'value', {
      secure: true,
      expires,
      domain: 'eggjs.org',
      path: '/',
      httpOnly: true,
    }).toHeader();
    assert(header.match(/expires=Wed, 01 Jan 2020 00:00:00 GMT/));
    header = new Cookie('name', 'value', {
      secure: true,
      maxAge: 1000,
      expires,
      domain: 'eggjs.org',
      path: '/',
      httpOnly: true,
    }).toHeader();
    assert(!header.match(/expires=Wed, 01 Jan 2020 00:00:00 GMT/));
  });
});

function shouldThrow(fn) {
  try {
    fn();
  } catch (err) {
    return err.message;
  }
  throw new Error('not thrown');
}
