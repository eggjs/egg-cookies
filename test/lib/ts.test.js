'use strict';

const assert = require('assert');

describe('start running ts file under the ts folder...', () => {

  it('should run successfully and generate a json file to compare values', done => {

    // This will dynamically add cookieTest and have a run
    // We must specify the compiler mode in compilerOptions, because
    // 'Promise' starts since es2015
    require('ts-node').register({
      typeCheck: true,
      compilerOptions: {
        target: 'es2015',
        module: 'commonjs',
        strict: true,
        lib: [
          'es2015',
        ],
      },
    });
    const result = require('../fixtures/ts/cookiesTest');

    // Check one by one
    assert(result.test1.actualValue === 'bar');
    assert(result.test1.actualIndex === -1);
    assert(result.test2.actualValue === 'bar');
    assert(result.test3.actualValue === undefined);

    // Use promisible's then to make a call back and check values
    result.test4.then(result => {
      assert(result.name === 'foo');
      assert(result.value === Buffer.allocUnsafe(4094).fill(49).toString());
      assert(result.hasCtx);
      assert(result.match);
      // Call back to tell that unit test is over
      done();
    });
  });
});
