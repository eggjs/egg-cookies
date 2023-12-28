'use strict';

const Cookies = require('../cookies');
const assert = require('assert');
const CookieError = require('../../lib/error');

describe('test/lib/cookies.test.js', () => {
  it('should encrypt error when keys not present', () => {
    const cookies = Cookies({}, { keys: null });
    try {
      cookies.set('foo', 'bar', { encrypt: true });
      throw new Error('should not exec');
    } catch (err) {
      assert(err.message === '.keys required for encrypt/sign cookies');
    }
  });

  it('should not thrown when keys not present and do not use encrypt or sign', () => {
    const cookies = Cookies({}, { keys: null });
    cookies.set('foo', 'bar', { encrypt: false, signed: false });
  });

  it('should encrypt ok', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { encrypt: true });
    const cookie = cookies.ctx.response.headers['set-cookie'][0];
    cookies.ctx.request.headers.cookie = cookie;
    const value = cookies.get('foo', { encrypt: true });
    assert(value, 'bar');
    assert(cookie.indexOf('bar') === -1);
  });

  it('should cache eygrip', () => {
    const keys = [ 'key' ];
    assert(Cookies({}, { keys }).keys === Cookies({}, { keys }).keys); // eslint-disable-line no-self-compare
  });

  it('should encrypt failed return undefined', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { encrypt: true });
    const cookie = cookies.ctx.response.headers['set-cookie'][0];
    const newCookies = Cookies({
      headers: { cookie },
    }, { keys: [ 'another key' ] });
    const value = newCookies.get('foo', { encrypt: true });
    assert(value === undefined);
  });

  it('should disable signed when encrypt enable', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { encrypt: true, signed: true });
    const cookie = cookies.ctx.response.headers['set-cookie'].join(';');
    cookies.ctx.request.headers.cookie = cookie;
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
    const cookie = cookies.ctx.response.headers['set-cookie'][0];
    assert(cookie.indexOf('secure') > 0);
  });

  it('should work with domain ok, when domain is a function', () => {
    const cookies = Cookies({}, {
      secure: true,
    });
    cookies.set('foo', 'bar', { encrypt: true, domain: () => 'foo.com' });
    const cookie = cookies.ctx.response.headers['set-cookie'][0];
    assert(cookie.indexOf('domain=foo.com') > 0);
  });

  it('should work with domain is empty string', () => {
    const cookies = Cookies({}, {
      secure: true,
    });
    cookies.set('foo', 'bar', { encrypt: true, domain: '' });
    const cookie = cookies.ctx.response.headers['set-cookie'][0];
    assert.equal(cookie, 'foo=SBfi5dnMSwNmMdeydI_zdw==; path=/; secure; httponly');
  });

  it('should work with domain is string', () => {
    const cookies = Cookies({}, {
      secure: true,
    });
    cookies.set('foo', 'bar', { encrypt: true, domain: 'foo.com' });
    const cookie = cookies.ctx.response.headers['set-cookie'][0];
    assert(cookie.indexOf('domain=foo.com') > 0);
  });

  it('should signed work fine', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar', { signed: true });
    const cookie = cookies.ctx.response.headers['set-cookie'].join(';');
    assert(cookie.indexOf('foo=bar') >= 0);
    assert(cookie.indexOf('foo.sig=') >= 0);
    cookies.ctx.request.headers.cookie = cookie;
    let value = cookies.get('foo', { signed: true });
    assert(value === 'bar');
    cookies.ctx.request.headers.cookie = cookie.replace('foo=bar', 'foo=bar1');
    value = cookies.get('foo', { signed: true });
    assert(!value);
    value = cookies.get('foo', { signed: false });
    assert(value === 'bar1');
  });

  it('should return undefined when header.cookie not exists', () => {
    const cookies = Cookies();
    assert(cookies.get('hello') === undefined);
  });

  it('should return undefined when cookie not exists', () => {
    const cookies = Cookies({
      headers: { cookie: 'foo=bar' },
    });
    assert(cookies.get('hello') === undefined);
  });

  it('should return undefined when signed and name.sig not exists', () => {
    const cookies = Cookies({
      headers: { cookie: 'foo=bar;' },
    });
    assert(cookies.get('foo', { signed: true }) === undefined);
    assert(cookies.get('foo', { signed: false }) === 'bar');
    assert(cookies.get('foo') === undefined);
  });

  it('should set .sig to null if not match', () => {
    const cookies = Cookies({
      headers: { cookie: 'foo=bar;foo.sig=bar.sig;' },
    });
    assert(cookies.get('foo', { signed: true }) === undefined);
    assert(cookies.ctx.response.headers['set-cookie'][0] === 'foo.sig=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
  });

  it('should update .sig if not match the first key', () => {
    const cookies = Cookies({
      headers: { cookie: 'foo=bar;foo.sig=bar.sig;' },
    }, { keys: [ 'hello', 'world' ] });
    cookies.set('foo', 'bar');
    const cookie = cookies.ctx.response.headers['set-cookie'].join(';');

    const newCookies = Cookies({
      headers: { cookie },
    }, { keys: [ 'hi', 'hello' ] });

    assert(newCookies.get('foo', { signed: true }) === 'bar');
    // call twice but should only update once
    newCookies.get('foo', { signed: true });
    assert(newCookies.ctx.response.headers['set-cookie'].length === 1);
    const newSign = newCookies.keys.sign('foo=bar');
    assert(newCookies.ctx.response.headers['set-cookie'][0].startsWith(`foo.sig=${newSign}`));
  });

  it('should not overwrite default', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar');
    cookies.set('foo', 'hello');
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=bar/));
  });

  it('should overwrite when opts.overwrite = true', () => {
    const cookies = Cookies();
    cookies.set('foo', 'bar');
    cookies.set('foo', 'hello', { overwrite: true });
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
  });

  it('should remove signed cookie ok', () => {
    const cookies = Cookies();
    cookies.set('foo', null, { signed: true });
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=; path=\/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly/));
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo\.sig=; path=\/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly/));
  });

  it('should remove encrypt cookie ok', () => {
    const cookies = Cookies();
    cookies.set('foo', null, { encrypt: true });
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=; path=\/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly/));
  });

  it('should remove cookie ok event it set maxAge', () => {
    const cookies = Cookies();
    cookies.set('foo', null, { signed: true, maxAge: 1200 });
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=; path=\/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly/));
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo\.sig=; path=\/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly/));
  });

  it('should add secure when ctx.secure = true', () => {
    const cookies = Cookies({}, { secure: true });
    cookies.set('foo', 'bar');
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/secure;/));
  });

  it('should not add secure when ctx.secure = true but opt.secure = false', () => {
    const cookies = Cookies({}, { secure: true });
    cookies.set('foo', 'bar', { secure: false });
    assert(!cookies.ctx.response.headers['set-cookie'].join(';').match(/secure;/));
  });

  it('should throw when ctx.secure = false but opt.secure = true', () => {
    const cookies = Cookies({}, { secure: false });
    try {
      cookies.set('foo', 'bar', { secure: true });
      throw new Error('should not exec');
    } catch (err) {
      assert(err instanceof CookieError);
      assert(err.message === 'Cannot send secure cookie over unencrypted connection');
    }
  });

  it('should set cookie success when set-cookie already exist', () => {
    const cookies = Cookies();
    cookies.ctx.response.headers['set-cookie'] = 'foo=bar';
    cookies.set('foo1', 'bar1');
    assert(cookies.ctx.response.headers['set-cookie'][0] === 'foo=bar');
    assert(cookies.ctx.response.headers['set-cookie'][1] === 'foo1=bar1; path=/; httponly');
    assert(cookies.ctx.response.headers['set-cookie'][2] === 'foo1.sig=_OGF14M_XqPTd58nMRUco2iwwhlZvq7h8ifl3Kej_jg; path=/; httponly');
  });

  it('should emit cookieLimitExceed event in app when value\'s length exceed the limit', done => {
    const cookies = Cookies();
    const value = Buffer.alloc(4094).fill(49).toString();
    cookies.app.on('cookieLimitExceed', params => {
      assert(params.name === 'foo');
      assert(params.value === value);
      assert(params.ctx);
      // check set-cookie header
      setImmediate(() => {
        assert(cookies.ctx.response.headers['set-cookie'][0].match(/foo=1{4094};/));
        done();
      });
    });
    cookies.set('foo', value);
  });

  it('should opts do not modify', () => {
    const cookies = Cookies({ secure: true });
    const opts = {
      signed: 1,
    };
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
  });

  it('should defaultCookieOptions with sameSite=lax', () => {
    const cookies = Cookies({ secure: true }, null, { sameSite: 'lax' });
    const opts = {
      signed: 1,
    };
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
    for (const str of cookies.ctx.response.headers['set-cookie']) {
      assert(str.includes('; path=/; samesite=lax; httponly'));
    }
  });

  it('should not send SameSite=None property on incompatible clients', () => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/64.0.3282.140 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3165.0 Safari/537.36',
      'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; OE106 Build/OPM1.171019.026) AppleWebKit/537.36 (KHTML%2C like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/11.9.4.974 UWS/2.13.2.90 Mobile Safari/537.36 AliApp(DingTalk/4.7.18) com.alibaba.android.rimet/12362010 Channel/1565683214685 language/zh-CN UT4Aplus/0.2.25',
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/63.0.3239.132 Safari/537.36 dingtalk-win/1.0.0 nw(0.14.7) DingTalk(4.7.19-Release.16) Mojo/1.0.0 Native AppType(release)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/62.0.3202.94 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/52.0.2723.2 Safari/537.36',
    ];
    for (const ua of userAgents) {
      const cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': ua,
        },
      }, { secure: true }, { sameSite: 'None' });
      const opts = {
        signed: 1,
      };
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
      for (const str of cookies.ctx.response.headers['set-cookie']) {
        assert(str.includes('; path=/; secure; httponly'));
      }
    }
  });

  it('should not send SameSite=None property on Chrome < 80', () => {
    const cookies = Cookies({
      secure: true,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.29 Safari/537.36',
      },
    }, { secure: true }, { sameSite: 'None' });
    const opts = {
      signed: 1,
    };
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
    for (const str of cookies.ctx.response.headers['set-cookie']) {
      assert(str.includes('; path=/; secure; httponly'));
    }
  });

  it('should send SameSite=None property on Chrome >= 80', () => {
    let cookies = Cookies({
      secure: true,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3945.29 Safari/537.36',
      },
    }, { secure: true }, { sameSite: 'None' });
    const opts = {
      signed: 1,
    };
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
    for (const str of cookies.ctx.response.headers['set-cookie']) {
      assert(str.includes('; path=/; samesite=none; secure; httponly'));
    }

    cookies = Cookies({
      secure: true,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.3945.29 Safari/537.36',
      },
    }, { secure: true }, { sameSite: 'None' });
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
    for (const str of cookies.ctx.response.headers['set-cookie']) {
      assert(str.includes('; path=/; samesite=none; secure; httponly'));
    }
  });

  it('should send SameSite=none property on compatible clients', () => {
    const cookies = Cookies({
      secure: true,
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/66.6 Mobile/14A5297c Safari/602.1',
      },
    }, { secure: true }, { sameSite: 'none' });

    const opts = {
      signed: 1,
    };
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
    for (const str of cookies.ctx.response.headers['set-cookie']) {
      assert(str.includes('; path=/; samesite=none; secure; httponly'));
    }
  });

  it('should not send SameSite=none property on non-secure context', () => {
    const cookies = Cookies({
      secure: false,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.3945.29 Safari/537.36',
      },
    }, null, { sameSite: 'none' });
    const opts = {
      signed: 1,
    };
    cookies.set('foo', 'hello', opts);

    assert(opts.signed === 1);
    assert(opts.secure === undefined);
    assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
    for (const str of cookies.ctx.response.headers['set-cookie']) {
      assert(str.includes('; path=/; httponly'));
    }
  });

  describe('opts.partitioned', () => {
    it('should not send partitioned property on incompatible clients', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/64.0.3282.140 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36',
        'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; OE106 Build/OPM1.171019.026) AppleWebKit/537.36 (KHTML%2C like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/11.9.4.974 UWS/2.13.2.90 Mobile Safari/537.36 AliApp(DingTalk/4.7.18) com.alibaba.android.rimet/12362010 Channel/1565683214685 language/zh-CN UT4Aplus/0.2.25',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/63.0.3239.132 Safari/537.36 dingtalk-win/1.0.0 nw(0.14.7) DingTalk(4.7.19-Release.16) Mojo/1.0.0 Native AppType(release)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/52.0.2723.2 Safari/537.36',
      ];
      for (const ua of userAgents) {
        const cookies = Cookies({
          secure: true,
          headers: {
            'user-agent': ua,
          },
        }, { secure: true }, { partitioned: true });
        const opts = {
          signed: 1,
        };
        cookies.set('foo', 'hello', opts);

        assert(opts.signed === 1);
        assert(opts.secure === undefined);
        assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
        for (const str of cookies.ctx.response.headers['set-cookie']) {
          assert(str.includes('; path=/; secure; httponly'));
        }
      }
    });

    it('should not send partitioned property on Chrome < 114', () => {
      const cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.3945.29 Safari/537.36',
        },
      }, { secure: true }, { partitioned: true });
      const opts = {
        signed: 1,
      };
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
      for (const str of cookies.ctx.response.headers['set-cookie']) {
        assert(str.includes('; path=/; secure; httponly'));
      }
    });

    it('should send partitioned property on Chrome >= 114', () => {
      let cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.3945.29 Safari/537.36',
        },
      }, { secure: true }, { partitioned: true });
      const opts = {
        signed: 1,
      };
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
      for (const str of cookies.ctx.response.headers['set-cookie']) {
        assert(str.includes('; path=/; secure; httponly; partitioned'));
      }

      cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.3945.29 Safari/537.36',
        },
      }, { secure: true }, { partitioned: true });
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
      for (const str of cookies.ctx.response.headers['set-cookie']) {
        assert(str.includes('; path=/; secure; httponly; partitioned'));
      }

      // empty user-agent
      cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': '',
        },
      }, { secure: true }, { partitioned: true });
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
      for (const str of cookies.ctx.response.headers['set-cookie']) {
        assert(str.includes('; path=/; secure; httponly; partitioned'));
      }
    });

    it('should not send SameSite=none property on non-secure context', () => {
      const cookies = Cookies({
        secure: false,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.3945.29 Safari/537.36',
        },
      }, null, { partitioned: true });
      const opts = {
        signed: 1,
      };
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      assert(cookies.ctx.response.headers['set-cookie'].join(';').match(/foo=hello/));
      for (const str of cookies.ctx.response.headers['set-cookie']) {
        assert(str.includes('; path=/; httponly'));
      }
    });

    it('should remove unpartitioned property first', () => {
      const cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.3945.29 Safari/537.36',
        },
      }, { secure: true }, { partitioned: true, removeUnpartitioned: true });
      const opts = {
        signed: 1,
      };
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      const headers = cookies.ctx.response.headers['set-cookie'];
      // console.log(headers);
      assert.equal(headers.length, 4);
      assert.equal(headers[0], 'foo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; httponly');
      assert.equal(headers[1], 'foo.sig=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; httponly');
      assert.equal(headers[2], 'foo=hello; path=/; secure; httponly; partitioned');
      assert.equal(headers[3], 'foo.sig=ZWbaA4bWk8ByBuYVgfmJ2DMvhhS3sOctMbfXAQ2vnwI; path=/; secure; httponly; partitioned');
    });

    it('should remove unpartitioned property first with overwrite = true', () => {
      const cookies = Cookies({
        secure: true,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.3945.29 Safari/537.36',
        },
      }, { secure: true }, { partitioned: true, removeUnpartitioned: true, overwrite: true });
      const opts = {
        signed: 1,
      };
      cookies.set('foo', 'hello2222', opts);
      cookies.set('foo', 'hello', opts);

      assert(opts.signed === 1);
      assert(opts.secure === undefined);
      const headers = cookies.ctx.response.headers['set-cookie'];
      assert.equal(headers.length, 4);
      assert.equal(headers[0], 'foo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; httponly');
      assert.equal(headers[1], 'foo.sig=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; httponly');
      assert.equal(headers[2], 'foo=hello; path=/; secure; httponly; partitioned');
      assert.equal(headers[3], 'foo.sig=ZWbaA4bWk8ByBuYVgfmJ2DMvhhS3sOctMbfXAQ2vnwI; path=/; secure; httponly; partitioned');
    });
  });
});
