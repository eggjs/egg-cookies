'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const EggCookies = require('..');
const Cookies = require('cookies');
const suite = new Benchmark.Suite();

const eggCookie = createEggCookie();
const cookie = createCookie();

eggCookie.set('foo', 'bar', {});
cookie.set('foo', 'bar', {});

suite
.add('create EggCookie', function() {
  createEggCookie();
})
.add('create Cookie', function() {
  createCookie();
})
.add('EggCookies.set with signed', function() {
  createEggCookie().set('foo', 'bar', { signed: true });
})
.add('Cookies.set with signed', function() {
  createCookie().set('foo', 'bar', { signed: true });
})
.add('EggCookies.set without signed', function() {
  createEggCookie().set('foo', 'bar', { signed: false });
})
.add('Cookies.set without signed', function() {
  createCookie().set('foo', 'bar', { signed: false });
})
.add('EggCookies.set without encrypt', function() {
  createEggCookie().set('foo', 'bar', { encrypt: true });
})
.on('cycle', event => benchmarks.add(event.target))
.on('start', () => console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date()))
.on('complete', () => {
  benchmarks.log();
  process.exit(0);
})
.run({ async: false });

function createCtx(egg) {
  const request = {
    headers: { cookie: 'foo=bar;' },
    get(key) {
      return this.headers[key.toLowerCase()];
    },
    getHeader(key) {
      return this.get(key);
    },
    protocol: 'https',
    secure: true,
  };
  const response = {
    headers: {},
    get(key) {
      return this.headers[key.toLowerCase()];
    },
    getHeader(key) {
      return this.get(key);
    },
  };
  function set(key, value) {
    this.headers[key.toLowerCase()] = value;
  }
  if (egg) response.set = set;
  else response.setHeader = set;

  return {
    request,
    response,
    res: response,
    req: request,
    set(key, value) {
      this.response.set(key, value);
    },
    get(key) {
      this.request.get(key);
    },
  };
}

function createEggCookie() {
  return new EggCookies(createCtx(true), [ 'key' ]);
}
function createCookie() {
  const ctx = createCtx();
  return new Cookies(ctx.req, ctx.res, { keys: [ 'key' ] });
}

// create EggCookie               x 4,606,537 ops/sec ±4.11% (78 runs sampled)
// create Cookie                  x   683,980 ops/sec ±2.93% (81 runs sampled)
// EggCookies.set with signed     x   110,234 ops/sec ±1.21% (85 runs sampled)
// Cookies.set with signed        x    76,925 ops/sec ±1.68% (81 runs sampled)
// EggCookies.set without signed  x   513,459 ops/sec ±0.99% (86 runs sampled)
// Cookies.set without signed     x   288,745 ops/sec ±1.87% (82 runs sampled)
// EggCookies.set without encrypt x    76,958 ops/sec ±2.55% (76 runs sampled)
