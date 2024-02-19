# egg-cookies

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-cookies.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-cookies
[ci-image]: https://github.com/eggjs/egg-cookies/actions/workflows/nodejs.yml/badge.svg
[ci-url]: https://github.com/eggjs/egg-cookies/actions/workflows/nodejs.yml
[codecov-image]: https://codecov.io/gh/eggjs/egg-cookies/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-cookies
[download-image]: https://img.shields.io/npm/dm/egg-cookies.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-cookies

Extends [pillarjs/cookies](https://github.com/pillarjs/cookies) to adapt koa and egg with some additional features.

## Encrypt

egg-cookies provide an alternative `encrypt` mode like `signed`. An encrypt cookie's value will be encrypted base on keys. Anyone who don't have the keys are unable to know the original cookie's value.

```js
const Cookies = require('egg-cookies');
const cookies = new Cookies(ctx, keys[, defaultCookieOptions]);

cookies.set('foo', 'bar', { encrypt: true });
cookies.get('foo', { encrypt: true });
```

**Note: you should both indicating in get and set in pairs.**

## Cookie Length Check

[Browsers all had some limitation in cookie's length](http://browsercookielimits.squawky.net/), so if set a cookie with an extremely long value(> 4093), egg-cookies will emit an `cookieLimitExceed` event. You can listen to this event and record.

```js
const Cookies = require('egg-cookies');
const cookies = new Cookies(ctx, keys);

cookies.on('cookieLimitExceed', { name, value } => {
  // log
});

cookies.set('foo', longText);
```

## License

[MIT](LICENSE)
<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|[<img src="https://avatars.githubusercontent.com/u/32174276?v=4" width="100px;"/><br/><sub><b>semantic-release-bot</b></sub>](https://github.com/semantic-release-bot)<br/>|[<img src="https://avatars.githubusercontent.com/u/227713?v=4" width="100px;"/><br/><sub><b>atian25</b></sub>](https://github.com/atian25)<br/>|[<img src="https://avatars.githubusercontent.com/u/5856440?v=4" width="100px;"/><br/><sub><b>whxaxes</b></sub>](https://github.com/whxaxes)<br/>|[<img src="https://avatars.githubusercontent.com/u/5102113?v=4" width="100px;"/><br/><sub><b>xyeric</b></sub>](https://github.com/xyeric)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
|[<img src="https://avatars.githubusercontent.com/u/3939959?v=4" width="100px;"/><br/><sub><b>jedmeng</b></sub>](https://github.com/jedmeng)<br/>|[<img src="https://avatars.githubusercontent.com/u/17005098?v=4" width="100px;"/><br/><sub><b>Junyan</b></sub>](https://github.com/Junyan)<br/>|[<img src="https://avatars.githubusercontent.com/u/12657964?v=4" width="100px;"/><br/><sub><b>beliefgp</b></sub>](https://github.com/beliefgp)<br/>|[<img src="https://avatars.githubusercontent.com/u/52845048?v=4" width="100px;"/><br/><sub><b>snapre</b></sub>](https://github.com/snapre)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/22520131?v=4" width="100px;"/><br/><sub><b>tang-xy</b></sub>](https://github.com/tang-xy)<br/>|
[<img src="https://avatars.githubusercontent.com/u/1276859?v=4" width="100px;"/><br/><sub><b>ziyunfei</b></sub>](https://github.com/ziyunfei)<br/>|[<img src="https://avatars.githubusercontent.com/u/12656301?v=4" width="100px;"/><br/><sub><b>brizer</b></sub>](https://github.com/brizer)<br/>|[<img src="https://avatars.githubusercontent.com/u/7692708?v=4" width="100px;"/><br/><sub><b>xuezier</b></sub>](https://github.com/xuezier)<br/>|[<img src="https://avatars.githubusercontent.com/u/16103358?v=4" width="100px;"/><br/><sub><b>onlylovermb</b></sub>](https://github.com/onlylovermb)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Mon Feb 19 2024 17:41:40 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
