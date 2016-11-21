'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const EggCookies = require('..');
const Cookies = require('cookies');
const suite = new Benchmark.Suite();

const keys = [ 'this is a very very loooooooooooooooooooooooooooooooooooooong key' ];

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
.add('EggCookies.set with encrypt', function() {
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
  return new EggCookies(createCtx(true), keys);
}
function createCookie() {
  const ctx = createCtx();
  return new Cookies(ctx.req, ctx.res, { keys });
}

// create EggCookie               x 6,122,689 ops/sec ±1.94% (84 runs sampled)
// create Cookie                  x   915,465 ops/sec ±2.64% (79 runs sampled)
// EggCookies.set with signed     x   105,077 ops/sec ±0.84% (86 runs sampled)
// Cookies.set with signed        x    69,956 ops/sec ±2.21% (80 runs sampled)
// EggCookies.set without signed  x   477,852 ops/sec ±1.04% (87 runs sampled)
// Cookies.set without signed     x   355,754 ops/sec ±1.96% (83 runs sampled)
// EggCookies.set with encrypt    x    88,396 ops/sec ±1.19% (83 runs sampled)
