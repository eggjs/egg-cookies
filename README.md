# @eggjs/cookies

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@eggjs/cookies.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@eggjs/cookies
[ci-image]: https://github.com/eggjs/egg-cookies/actions/workflows/nodejs.yml/badge.svg
[ci-url]: https://github.com/eggjs/egg-cookies/actions/workflows/nodejs.yml
[codecov-image]: https://codecov.io/gh/eggjs/egg-cookies/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-cookies
[download-image]: https://img.shields.io/npm/dm/@eggjs/cookies.svg?style=flat-square
[download-url]: https://npmjs.org/package/@eggjs/cookies

Extends [pillarjs/cookies](https://github.com/pillarjs/cookies) to adapt koa and egg with some additional features.

## Encrypt

`@eggjs/cookies` provide an alternative `encrypt` mode like `signed`. An encrypt cookie's value will be encrypted base on keys. Anyone who don't have the keys are unable to know the original cookie's value.

```ts
import { Cookies } from '@eggjs/cookies';

const cookies = new Cookies(ctx, keys[, defaultCookieOptions]);

cookies.set('foo', 'bar', { encrypt: true });
cookies.get('foo', { encrypt: true });
```

**Note: you should both indicating in get and set in pairs.**

## Cookie Length Check

[Browsers all had some limitation in cookie's length](http://browsercookielimits.squawky.net/), so if set a cookie with an extremely long value(> 4093), `@eggjs/cookies` will emit an `cookieLimitExceed` event. You can listen to this event and record.

```ts
import { Cookies } from '@eggjs/cookies';

const cookies = new Cookies(ctx, keys);

cookies.on('cookieLimitExceed', ({ name, value }) => {
  // log
});

cookies.set('foo', longText);
```

## License

[MIT](LICENSE)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=eggjs/egg-cookies)](https://github.com/eggjs/egg-cookies/graphs/contributors)

Made with [contributors-img](https://contrib.rocks).
