'use strict';

/**
 * Module dependencies.
 */

const Cookies = require('../cookies');
const assert = require('assert');

describe('test/lib/cookies.test.js', () => {
  it('should get error without keys', () => {
    const cookies = Cookies({
      headers: {
        cookie: 'foo=bar',
      },
    }, { keys: false });
    let errored = false;
    try {
      cookies.get('foo', { encrypt: true });
    } catch (err) {
      assert.equal(err.message, '.keys required for encrypt cookies');
      errored = true;
    }
    assert(errored);
  });

  it('should set error without keys', () => {
    const cookies = Cookies({}, { keys: false });
    let errored = false;
    try {
      cookies.set('foo', 'bar', { encrypt: true });
    } catch (err) {
      assert.equal(err.message, '.keys required for encrypt cookies');
      errored = true;
    }
    assert(errored);
  });

  it('should encrypt ok', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { encrypt: true });
    const cookie = cookies.response.headers['Set-Cookie'][0];
    cookies.request.headers.cookie = cookie;
    const value = cookies.get('foo', { encrypt: true });
    assert(value, 'bar');
    assert(cookie.indexOf('bar') === -1);
  });

  it('should disable signed when encrypt enable', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { encrypt: true, signed: true });
    const cookie = cookies.response.headers['Set-Cookie'].join(';');
    cookies.request.headers.cookie = cookie;
    const value = cookies.get('foo', { encrypt: true });
    assert(value, 'bar');
    assert(cookie.indexOf('bar') === -1);
    assert(cookie.indexOf('sig') === -1);
  });

  it('should work with secure ok', () => {
    const cookies = Cookies({}, {
      secure: true,
    });
    cookies.set('foo', 'bar', { encrypt: true });
    const cookie = cookies.response.headers['Set-Cookie'][0];
    assert(cookie.indexOf('secure') > 0);
  });

  it('should signed work fine', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { signed: true });
    const cookie = cookies.response.headers['Set-Cookie'].join(';');
    assert(cookie.indexOf('foo=bar') >= 0);
    assert(cookie.indexOf('foo.sig=') >= 0);
    cookies.request.headers.cookie = cookie;
    let value = cookies.get('foo', { signed: true });
    assert(value === 'bar');
    cookies.request.headers.cookie = cookie.replace('foo=bar', 'foo=bar1');
    value = cookies.get('foo', { signed: true });
    assert(!value);
    value = cookies.get('foo');
    assert(value === 'bar1');
  });
});
