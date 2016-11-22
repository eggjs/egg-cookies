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
  createEggCookie().get('sign', { signed: false });
})
.add('EggCookies.get with encrypt', function() {
  createEggCookie().get('eggEncrypt', { encrypt: false });
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

// create EggCookie              x 6,251,382 ops/sec ±0.87% (86 runs sampled)
// create Cookie                 x   904,067 ops/sec ±2.36% (78 runs sampled)
// EggCookies.set with signed    x    92,009 ops/sec ±1.16% (86 runs sampled)
// Cookies.set with signed       x    67,426 ops/sec ±2.37% (83 runs sampled)
// EggCookies.set without signed x   455,434 ops/sec ±0.77% (87 runs sampled)
// Cookies.set without signed    x   341,823 ops/sec ±2.54% (78 runs sampled)
// EggCookies.set with encrypt   x    83,106 ops/sec ±1.17% (81 runs sampled)
// EggCookies.get with signed    x    85,097 ops/sec ±1.53% (85 runs sampled)
// Cookies.get with signed       x    87,334 ops/sec ±2.92% (77 runs sampled)
// EggCookies.get without signed x 2,120,445 ops/sec ±1.08% (86 runs sampled)
// Cookies.get without signed    x 1,988,503 ops/sec ±1.41% (85 runs sampled)
// EggCookies.get with encrypt   x   749,463 ops/sec ±1.26% (83 runs sampled)
