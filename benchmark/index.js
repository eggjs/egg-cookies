'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const EggCookies = require('..');
const Cookies = require('cookies');
const suite = new Benchmark.Suite();

const keys = [ 'this is a very very loooooooooooooooooooooooooooooooooooooong key' ];

const eggCookie = createEggCookie();
const cookie = createCookie();

console.log('------------get test----------');
console.log(eggCookie.get('eggSign', { signed: true }));
console.log(eggCookie.get('eggSign'));
console.log(eggCookie.get('eggEncrypt', { encrypt: true }));
console.log(cookie.get('sign', { signed: true }));
console.log(cookie.get('sign'));

console.log('------------set test----------');
eggCookie.set('eggSign', 'egg signed cookie', { signed: true });
cookie.set('sign', 'signed cookie', { signed: true });
eggCookie.set('eggEncrypt', 'egg encrypt cookie', { encrypt: true });
console.log(eggCookie.ctx.response.headers);
console.log(cookie.response.headers);

console.log('------------benchmark start----------');

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
.add('EggCookies.get with signed', function() {
  createEggCookie().get('eggSign', { signed: true });
})
.add('Cookies.get with signed', function() {
  createCookie().get('sign', { signed: true });
})
.add('EggCookies.get without signed', function() {
  createEggCookie().get('eggSign', { signed: false });
})
.add('Cookies.get without signed', function() {
  createCookie().get('sign', { signed: false });
})
.add('EggCookies.get with encrypt', function() {
  createEggCookie().get('eggEncrypt', { encrypt: true });
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
    headers: { cookie: 'eggSign=egg signed cookie; eggSign.sig=SQ4wyGWr8vhSg7XCiz_MSxpHQ2GImbxE24fg4JVz7-o; sign=signed cookie; sign.sig=PvhhL9qTxML8uYSOaG_4Fr6EIEE; eggEncrypt=EpfmKzY4tX5OhafZS-onWOEIL0-CR6N_uGkFUFDCUno=;' },
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
      return this.request.get(key);
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

// create EggCookie              x 5,999,177 ops/sec ±2.61% (82 runs sampled)
// create Cookie                 x   850,087 ops/sec ±4.30% (76 runs sampled)
// EggCookies.set with signed    x    95,845 ops/sec ±1.06% (87 runs sampled)
// Cookies.set with signed       x    67,529 ops/sec ±2.32% (80 runs sampled)
// EggCookies.set without signed x   503,289 ops/sec ±0.86% (85 runs sampled)
// Cookies.set without signed    x   343,363 ops/sec ±2.27% (83 runs sampled)
// EggCookies.set with encrypt   x    79,859 ops/sec ±2.29% (80 runs sampled)
// EggCookies.get with signed    x    86,470 ops/sec ±6.10% (78 runs sampled)
// Cookies.get with signed       x    90,658 ops/sec ±2.75% (79 runs sampled)
// EggCookies.get without signed x 2,088,065 ops/sec ±0.91% (85 runs sampled)
// Cookies.get without signed    x   727,996 ops/sec ±2.13% (74 runs sampled)
// EggCookies.get with encrypt   x    79,032 ops/sec ±1.47% (81 runs sampled)
