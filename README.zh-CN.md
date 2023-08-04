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

为 egg 提供 cookie 操作的封装。

```js
ctx.cookies = new Cookies(ctx, keys[, defaultCookieOptions]);
ctx.cookies.get('key', 'value', options);
ctx.cookies.set('key', 'value', options);
```

## 初始化

初始化时需要传递 Array 类型 的keys 参数，否则无法使用 cookies 的 `signed` 和 `encrypt` 功能。

每次设置或读取 signed cookie 或者 encrypt cookie 的时候，会用 keys 进行加密。每次加密都通过 keys 数组的第一个 key 进行加密，解密会从先到后逐个 key 尝试解密。读取 signed cookie 时，如果发现不是用第一个 key 进行加密时，会更新签名为第一个 key 加密的值。读取 encrypt cookie 时不会进行更新操作。

## 设置 cookie

通过 `cookies.set(key, value, options)` 的方式来设置一个 cookie。其中 options 支持的参数有：

- path - `String` cookie 的有效路径，默认为 `/`。
- domain - `String` cookie 的有效域名范围，默认为 `undefined`。
- expires - `Date` cookie 的失效时间。
- maxAge - `Number` cookie 的最大有效时间，如果设置了 maxAge，将会覆盖 expires 的值。
- secure - `Boolean` 是否只在加密信道中传输，注意，如果请求为 http 时，不允许设置为 true https 时自动设置为 ture。
- httpOnly - `Boolean` 如果设置为 ture，则浏览器中不允许读取这个 cookie 的值。
- overwrite - `Boolean` 如果设置为 true，在一个请求上重复写入同一个 key 将覆盖前一次写入的值，默认为 false。
- signed - `Boolean` 是否需要对 cookie 进行签名，需要配合 get 时传递 signed 参数，此时前端无法篡改这个 cookie，默认为 true。
- encrypt - `Boolean` 是否需要对 cookie 进行加密，需要配合 get 时传递 encrypt 参数，此时前端无法读到真实的 cookie 值，默认为 false。

## 读取 cookie

通过 `cookies.get(key, value, options)` 的方式来读取一个 cookie。其中 options 支持的参数有：

- signed - `Boolean` 是否需要对 cookie 进行验签，需要配合 set 时传递 signed 参数，此时前端无法篡改这个 cookie，默认为 true。
- encrypt - `Boolean` 是否需要对 cookie 进行解密，需要配合 set 时传递 encrypt 参数，此时前端无法读到真实的 cookie 值，默认为 false。

## 删除 cookie

通过 `cookie.set(key, null)` 来删除一个 cookie。如果传递了 `signed` 参数，签名也会被删除。

## License

[MIT](LICENSE.txt)
<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|[<img src="https://avatars.githubusercontent.com/u/227713?v=4" width="100px;"/><br/><sub><b>atian25</b></sub>](https://github.com/atian25)<br/>|[<img src="https://avatars.githubusercontent.com/u/5856440?v=4" width="100px;"/><br/><sub><b>whxaxes</b></sub>](https://github.com/whxaxes)<br/>|[<img src="https://avatars.githubusercontent.com/u/5102113?v=4" width="100px;"/><br/><sub><b>xyeric</b></sub>](https://github.com/xyeric)<br/>|[<img src="https://avatars.githubusercontent.com/u/3939959?v=4" width="100px;"/><br/><sub><b>jedmeng</b></sub>](https://github.com/jedmeng)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
|[<img src="https://avatars.githubusercontent.com/u/17005098?v=4" width="100px;"/><br/><sub><b>Junyan</b></sub>](https://github.com/Junyan)<br/>|[<img src="https://avatars.githubusercontent.com/u/12657964?v=4" width="100px;"/><br/><sub><b>beliefgp</b></sub>](https://github.com/beliefgp)<br/>|[<img src="https://avatars.githubusercontent.com/u/52845048?v=4" width="100px;"/><br/><sub><b>snapre</b></sub>](https://github.com/snapre)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/32174276?v=4" width="100px;"/><br/><sub><b>semantic-release-bot</b></sub>](https://github.com/semantic-release-bot)<br/>|[<img src="https://avatars.githubusercontent.com/u/1276859?v=4" width="100px;"/><br/><sub><b>ziyunfei</b></sub>](https://github.com/ziyunfei)<br/>|
[<img src="https://avatars.githubusercontent.com/u/12656301?v=4" width="100px;"/><br/><sub><b>brizer</b></sub>](https://github.com/brizer)<br/>|[<img src="https://avatars.githubusercontent.com/u/7692708?v=4" width="100px;"/><br/><sub><b>xuezier</b></sub>](https://github.com/xuezier)<br/>|[<img src="https://avatars.githubusercontent.com/u/16103358?v=4" width="100px;"/><br/><sub><b>onlylovermb</b></sub>](https://github.com/onlylovermb)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Sat Aug 05 2023 01:46:53 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->