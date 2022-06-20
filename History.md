
2.6.1 / 2022-06-20
==================

**others**
  * [[`ebe330e`](http://github.com/eggjs/egg-cookies/commit/ebe330ea461be73e65dd1e2bbd4c9e3eba5e8d89)] - 🐛 FIX: Avoid ReDoS (#36) (fengmk2 <<fengmk2@gmail.com>>)

2.6.0 / 2022-06-20
==================

**features**
  * [[`7ed0ded`](http://github.com/eggjs/egg-cookies/commit/7ed0ded5492ebd7a2001407c9a9af638dcfd5307)] - feat: deprecated crypto api (#35) (吖猩 <<whxaxes@gmail.com>>)

2.5.0 / 2022-05-02
==================

**features**
  * [[`7377d3b`](http://github.com/eggjs/egg-cookies/commit/7377d3b0a9ee6d137bc07f4742aa499e9ed47d8d)] - feat: add CookieError (#31) (图南 <<xzj15859722542@hotmail.com>>)

**others**
  * [[`d27be06`](http://github.com/eggjs/egg-cookies/commit/d27be0659889d12af245149b633e7274790a01c4)] - 🤖 TEST: Run on node 18 (#34) (fengmk2 <<fengmk2@gmail.com>>)
  * [[`9e770ee`](http://github.com/eggjs/egg-cookies/commit/9e770ee61a9e6f1ce9b19e8e028f9847c386f3a0)] - Create codeql-analysis.yml (fengmk2 <<fengmk2@gmail.com>>)
  * [[`eff0195`](http://github.com/eggjs/egg-cookies/commit/eff01956de00a95fab8a3367ade61b5b8a55b76d)] - chore: update build status badge (#33) (XiaoRui <<xiangwu619@gmail.com>>)

2.4.3 / 2022-04-29
==================

**fixes**
  * [[`c8c42d3`](http://github.com/eggjs/egg-cookies/commit/c8c42d30b41f7c3f6c2e9231364e4acf47cea221)] - fix: should only update .sig once (#32) (TZ | 天猪 <<atian25@qq.com>>)

2.4.2 / 2020-06-28
==================

**fixes**
  * [[`a72fd0c`](http://github.com/eggjs/egg-cookies/commit/a72fd0cd9518ad8cfb3ad7c8ace1eb14097cea7e)] - fix: ignore maxAge = 0 (#29) (Yiyu He <<dead_horse@qq.com>>)

2.4.1 / 2020-06-28
==================

**fixes**
  * [[`7a87cc1`](http://github.com/eggjs/egg-cookies/commit/7a87cc16108bc5b542c0fbe91c4e4a6e986573de)] - fix: ignore invalid maxage (#28) (Yiyu He <<dead_horse@qq.com>>)

2.4.0 / 2020-06-22
==================

**features**
  * [[`4417dda`](http://github.com/eggjs/egg-cookies/commit/4417ddacecde2dff3792ca10e0bf05fc94a991ee)] - feat: Send `max-age` header as well as `expires` if it is set(#27) (Junyan <<yancoding@gmail.com>>)

2.3.4 / 2020-06-12
==================

**fixes**
  * [[`a146191`](http://github.com/eggjs/egg-cookies/commit/a14619139f585da290d693e6dfcf3e29304bc337)] - fix(typings): value of set method should support null type (#21) (Jedmeng <<roy.urey@gmail.com>>)

2.3.3 / 2020-03-27
==================

**fixes**
  * [[`b3f86c0`](http://github.com/eggjs/egg-cookies/commit/b3f86c01b19b790f8c06aca143a094ed4fa575bd)] - fix(SameSite): don't send SameSite=None on non-secure context (#26) (Eric Zhang <<hixyeric@gmail.com>>)

2.3.2 / 2020-02-19
==================

**fixes**
  * [[`c6e1e74`](http://github.com/eggjs/egg-cookies/commit/c6e1e74e77c53f68e79f0ebd799c755db470badd)] - fix: don't send SameSite=None on Chromium/Chrome < 80.x (#25) (fengmk2 <<fengmk2@gmail.com>>)

2.3.1 / 2019-12-17
==================

**fixes**
  * [[`d4f443a`](http://github.com/eggjs/egg-cookies/commit/d4f443a5bf3bfd0ba7bc726b1e8b74a35ba265d6)] - fix: don't set samesite=none on incompatible clients (#23) (fengmk2 <<fengmk2@gmail.com>>)

2.3.0 / 2019-12-06
==================

**features**
  * [[`d5e3d21`](http://github.com/eggjs/egg-cookies/commit/d5e3d215b1c51f70d932dba391d7da228a302312)] - feat: support SameSite=None (#18) (ziyunfei <<446240525@qq.com>>)
  * [[`4dd74d2`](http://github.com/eggjs/egg-cookies/commit/4dd74d2078b5aea11f11b3b40605b702ca9ccd60)] - feat: allow set default cookie options on top level (#22) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`57a005f`](http://github.com/eggjs/egg-cookies/commit/57a005fd501dad5fdadc25ea94db5474fbd6ca8c)] - chore: add license decoration (#20) (刘放 <<brizer@users.noreply.github.com>>)

2.2.7 / 2019-04-28
==================

**fixes**
  * [[`64e93e9`](http://github.com/eggjs/egg-cookies/commit/64e93e919558ee96e29de5c49d7132595e96b9b5)] - fix: empty cookie value should ignore maxAge (#17) (fengmk2 <<fengmk2@gmail.com>>)

2.2.6 / 2018-09-07
==================

  * fix: should still support 4, 6 (#16)

2.2.5 / 2018-09-07
==================

  * chore(typings): Remove 'ctx' in EggCookie's declaration and add a missing unit test (#15)

2.2.4 / 2018-09-06
==================

  * fix: public files && deps (#14)

2.2.3 / 2018-09-06
==================

  * chore: adjust some dep && config (#13)
  * test: Add unit tests for ts (#12)
  * chore(typings):  Extract 'EggCookies' for TypeScript intellisense (#11)

2.2.2 / 2017-12-14
==================

**fixes**
  * [[`d199238`](http://github.com/eggjs/egg-cookies/commit/d1992389558c24f26fbd6b617054c535e2c51319)] - fix: don't modify options (#9) (Roc Gao <<ggjqzjgp103@qq.com>>)

**others**
  * [[`1037873`](http://github.com/eggjs/egg-cookies/commit/103787342f9b45bcc794ec2adeda5e809af3328b)] - chore: jsdoc typo (#6) (TZ | 天猪 <<atian25@qq.com>>)

2.2.1 / 2017-02-22
==================

  * fix: emit on ctx.app (#5)

2.2.0 / 2017-02-21
==================

  * feat: check cookie value's length (#4)
  * feat: support cookie.sameSite (#3)

2.1.0 / 2016-11-22
==================

  * feat: cache keygrip (#2)

2.0.0 / 2016-11-22
==================

  * refactor: rewrite keygrip and cookies for egg/koa (#1)
  * chore: add zh-CN readme

1.0.0 / 2016-07-15
==================

  * init version
