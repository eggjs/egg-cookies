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

// EggCookies.set with signed     x  98,816 ops/sec ±1.24% (83 runs sampled)
// Cookies.set with signed        x  75,334 ops/sec ±1.34% (83 runs sampled)
// EggCookies.set without signed  x 518,623 ops/sec ±0.74% (86 runs sampled)
// Cookies.set without signed     x 302,208 ops/sec ±2.06% (82 runs sampled)
// EggCookies.set without encrypt x  83,854 ops/sec ±1.07% (81 runs sampled)
