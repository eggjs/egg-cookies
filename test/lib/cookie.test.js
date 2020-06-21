'use strict';

const Cookie = require('../../lib/cookie');
const assert = require('assert');

function assertExceptionCheck(expectedMsg) {
  return err => {
    return err.message === expectedMsg;
  };
}
describe('test/lib/cookie.test.js', () => {
  it('create cookies contains invalid string error should throw', () => {
    assert.throws(() => new Cookie('中文', 'value'), assertExceptionCheck('argument name is invalid'));
    assert.throws(() => new Cookie('name', '中文'), assertExceptionCheck('argument value is invalid'));
    assert.throws(() => new Cookie('name', 'value', { path: '中文' }), assertExceptionCheck('argument option path is invalid'));
    assert.throws(() => new Cookie('name', 'value', { domain: '中文' }), assertExceptionCheck('argument option domain is invalid'));
  });

  it('set expires to 0 if value not present', () => {
    assert(new Cookie('name', null).attrs.expires.getTime() === 0);
  });

  describe('toString()', () => {
    it('return name=vaule', () => {
      assert(new Cookie('name', 'value').toString() === 'name=value');
    });
  });

  describe('toHeader()', () => {
    it('return name=vaule;params', () => {
      assert(new Cookie('name', 'value', {
        secure: true,
        maxAge: 1000,
        domain: 'eggjs.org',
        path: '/',
        httpOnly: true,
      }).toHeader().match(/^name=value; path=\/; max-age=1; expires=(.*?)GMT; domain=eggjs\.org; secure; httponly$/));
    });

    it('donnot set path when set path to null', () => {
      const header = new Cookie('name', 'value', {
        path: null,
      }).toHeader();
      assert(!header.match(/path=/));
    });

    it('donnot set httponly when set httpOnly to false', () => {
      const header = new Cookie('name', 'value', {
        httpOnly: false,
      }).toHeader();
      assert(!header.match(/httponly/));
    });
  });

  describe('maxAge', () => {
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

  describe('sameSite', () => {
    it('should default to false', () => {
      const cookie = new Cookie('foo', 'bar');
      assert.equal(cookie.attrs.sameSite, false);
    });

    it('should throw on invalid value', () => {
      assert.throws(() => {
        new Cookie('foo', 'bar', { sameSite: 'foo' });
      }, /argument option sameSite is invalid/);
    });

    describe('when set to falsy values', () => {
      it('should not add "samesite" attribute in header', () => {
        const falsyValues = [ false, 0, '', null, undefined, NaN ];
        falsyValues.forEach(falsy => {
          const cookie = new Cookie('foo', 'bar', { sameSite: falsy });
          assert.ok(Object.is(cookie.attrs.sameSite, falsy));
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; httponly');
        });
      });
    });

    describe('when set to "true"', () => {
      it('should set "samesite=strict" attribute in header', () => {
        const cookie = new Cookie('foo', 'bar', { sameSite: true });
        assert.equal(cookie.attrs.sameSite, true);
        assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=strict; httponly');
      });
    });

    describe('when set to "none"', () => {
      it('should set "samesite=none" attribute in header', () => {
        {
          const cookie = new Cookie('foo', 'bar', { sameSite: 'none' });
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=none; httponly');
        }
        {
          const cookie = new Cookie('foo', 'bar', { sameSite: 'None' });
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=none; httponly');
        }
      });
    });

    describe('when set to "lax"', () => {
      it('should set "samesite=lax" attribute in header', () => {
        {
          const cookie = new Cookie('foo', 'bar', { sameSite: 'lax' });
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=lax; httponly');
        }
        {
          const cookie = new Cookie('foo', 'bar', { sameSite: 'Lax' });
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=lax; httponly');
        }
      });
    });

    describe('when set to "strict"', () => {
      it('should set "samesite=strict" attribute in header', () => {
        {
          const cookie = new Cookie('foo', 'bar', { sameSite: 'strict' });
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=strict; httponly');
        }
        {
          const cookie = new Cookie('foo', 'bar', { sameSite: 'Strict' });
          assert.equal(cookie.toHeader(), 'foo=bar; path=/; samesite=strict; httponly');
        }
      });
    });
  });
});
